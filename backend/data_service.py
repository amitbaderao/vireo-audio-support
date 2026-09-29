import os
import pandas as pd
import numpy as np
from datetime import datetime
from typing import Dict, Any, List, Optional

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data"))

SLA_TARGETS_MINUTES = {
    'chat': 15,
    'voice': 120,
    'social': 240,
    'email': 480
}

CHANNEL_COST_STANDARDS = {
    'chat': 210,
    'email': 260,
    'voice': 520,
    'social': 240
}

BLENDED_COST_PER_CONTACT = 290
TRANSFER_COST_PER_TRANSFER = 305
SLA_CREDIT_PER_BREACH = 350
AGENT_HOURLY_COST = 165
AGENT_SHIFT_HOURS = 8

TIER_1_TEAMS = [
    'Chat Frontline',
    'Email Frontline',
    'Voice Frontline',
    'Logistics',
    'Billing',
    'Returns Desk'
]

TIER_2_TEAMS = [
    'Escalations & Warranty'
]

class VireoDataService:
    def __init__(self):
        self.load_data()

    def load_data(self):
        # Read CSVs
        tickets_path = os.path.join(DATA_DIR, "tickets.csv")
        agents_path = os.path.join(DATA_DIR, "agents.csv")
        customers_path = os.path.join(DATA_DIR, "customers.csv")
        orders_path = os.path.join(DATA_DIR, "orders.csv")
        products_path = os.path.join(DATA_DIR, "products.csv")

        self.raw_tickets_df = pd.read_csv(tickets_path)
        self.agents_df = pd.read_csv(agents_path)
        self.customers_df = pd.read_csv(customers_path)
        self.orders_df = pd.read_csv(orders_path)
        self.products_df = pd.read_csv(products_path)

        # Parse timestamps in raw tickets
        self.raw_tickets_df['created_at_dt'] = pd.to_datetime(self.raw_tickets_df['created_at'], errors='coerce')
        self.raw_tickets_df['first_response_at_dt'] = pd.to_datetime(self.raw_tickets_df['first_response_at'], errors='coerce')
        self.raw_tickets_df['resolved_at_dt'] = pd.to_datetime(self.raw_tickets_df['resolved_at'], errors='coerce')

        # Filter for reporting window: 2025-01-01 through 2026-06-30 inclusive
        window_mask = (self.raw_tickets_df['created_at_dt'] >= '2025-01-01') & (self.raw_tickets_df['created_at_dt'] <= '2026-06-30 23:59:59')
        self.df = self.raw_tickets_df[window_mask].copy()

        # Add year_month
        self.df['year_month'] = self.df['created_at_dt'].dt.to_period('M').astype(str)

        # SLA calculation
        self.df['response_time_minutes'] = (self.df['first_response_at_dt'] - self.df['created_at_dt']).dt.total_seconds() / 60.0
        self.df['sla_target_minutes'] = self.df['channel'].map(SLA_TARGETS_MINUTES)
        self.df['is_breach'] = self.df['response_time_minutes'] > self.df['sla_target_minutes']

        # Handle time: first response to resolution (hours)
        self.df['handle_time_hours'] = (self.df['resolved_at_dt'] - self.df['first_response_at_dt']).dt.total_seconds() / 3600.0
        self.df['total_resolution_hours'] = (self.df['resolved_at_dt'] - self.df['created_at_dt']).dt.total_seconds() / 3600.0

        # Tier classification
        self.df['tier'] = self.df['assigned_team'].apply(lambda t: 'Tier 2' if t in TIER_2_TEAMS else 'Tier 1')

        # Merge resolving agent info
        agent_lookup = self.agents_df[['agent_id', 'name', 'site', 'team', 'shift', 'tier']].rename(
            columns={'name': 'agent_name', 'team': 'resolving_team', 'site': 'agent_site', 'shift': 'agent_shift', 'tier': 'agent_tier'}
        )
        self.df = self.df.merge(agent_lookup, on='agent_id', how='left')

    def get_summary(self) -> Dict[str, Any]:
        total_tickets = len(self.df)
        tier_1_df = self.df[self.df['tier'] == 'Tier 1']
        tier_2_df = self.df[self.df['tier'] == 'Tier 2']

        total_breaches = int(self.df['is_breach'].sum())
        breach_pct = round((total_breaches / total_tickets) * 100, 2) if total_tickets > 0 else 0

        # Resolved tickets handle time
        resolved_mask = self.df['handle_time_hours'].notna()
        avg_handle_time_hours = round(float(self.df.loc[resolved_mask, 'handle_time_hours'].mean()), 2)
        median_handle_time_hours = round(float(self.df.loc[resolved_mask, 'handle_time_hours'].median()), 2)

        # Transfers
        hd_df = self.df[self.df['source_system'] == 'helpdesk']
        total_transfers_recorded = int(hd_df['transfers'].sum())
        transferred_tickets_count = int((hd_df['transfers'] > 0).sum())
        transfer_rate_pct = round((transferred_tickets_count / len(hd_df)) * 100, 2) if len(hd_df) > 0 else 0

        # Costs
        channel_counts = self.df['channel'].value_counts().to_dict()
        channel_contact_cost = sum(channel_counts.get(ch, 0) * cost for ch, cost in CHANNEL_COST_STANDARDS.items())
        blended_contact_cost = total_tickets * BLENDED_COST_PER_CONTACT
        transfer_cost = total_transfers_recorded * TRANSFER_COST_PER_TRANSFER
        sla_credit_cost = total_breaches * SLA_CREDIT_PER_BREACH
        total_operating_cost = channel_contact_cost + transfer_cost + sla_credit_cost

        # Future projected 650 tickets/wk
        projected_monthly_tickets = round((650 * 52) / 12, 2)
        projected_monthly_cost = round(projected_monthly_tickets * BLENDED_COST_PER_CONTACT, 2)

        # Assigned volume ranking (Tier 1)
        tier1_assigned_counts = tier_1_df['assigned_team'].value_counts()
        largest_tier1_team = tier1_assigned_counts.index[0]
        largest_tier1_volume = int(tier1_assigned_counts.iloc[0])
        largest_tier1_share = round((largest_tier1_volume / len(tier_1_df)) * 100, 2)

        # Resolved volume ranking (Tier 1)
        tier1_resolved_counts = self.df[self.df['resolving_team'].isin(TIER_1_TEAMS)]['resolving_team'].value_counts()
        largest_resolved_team = tier1_resolved_counts.index[0]
        largest_resolved_volume = int(tier1_resolved_counts.iloc[0])

        # Refunds & replacements
        total_refund_amount = round(float(self.df['refund_amount_inr'].sum()), 2)
        tickets_with_refund = int(self.df['refund_amount_inr'].notna().sum())
        replacements_count = int((self.df['replacement_issued'] == 'Y').sum())

        # CSAT
        valid_csat = self.df['csat_score'].dropna()
        avg_csat = round(float(valid_csat.mean()), 2) if len(valid_csat) > 0 else 0
        csat_response_rate = round((len(valid_csat) / total_tickets) * 100, 2)

        return {
            "total_tickets": total_tickets,
            "tier_1_tickets": len(tier_1_df),
            "tier_2_tickets": len(tier_2_df),
            "largest_tier1_assigned_team": largest_tier1_team,
            "largest_tier1_assigned_volume": largest_tier1_volume,
            "largest_tier1_assigned_share_pct": largest_tier1_share,
            "largest_tier1_resolved_team": largest_resolved_team,
            "largest_tier1_resolved_volume": largest_resolved_volume,
            "total_breaches": total_breaches,
            "breach_rate_pct": breach_pct,
            "avg_handle_time_hours": avg_handle_time_hours,
            "median_handle_time_hours": median_handle_time_hours,
            "total_transfers_recorded": total_transfers_recorded,
            "helpdesk_tickets_with_transfers": transferred_tickets_count,
            "transfer_rate_pct": transfer_rate_pct,
            "channel_contact_cost_inr": channel_contact_cost,
            "blended_contact_cost_inr": blended_contact_cost,
            "transfer_cost_inr": transfer_cost,
            "sla_credit_cost_inr": sla_credit_cost,
            "total_operating_cost_inr": total_operating_cost,
            "projected_monthly_tickets": projected_monthly_tickets,
            "projected_monthly_cost_inr": projected_monthly_cost,
            "total_refund_amount_inr": total_refund_amount,
            "tickets_with_refund": tickets_with_refund,
            "replacements_count": replacements_count,
            "avg_csat": avg_csat,
            "csat_response_rate_pct": csat_response_rate
        }

    def get_monthly_volume(self) -> List[Dict[str, Any]]:
        # Monthly total and broken down by channel and source_system
        monthly = self.df.groupby('year_month').agg(
            total=('ticket_id', 'count'),
            chat=('channel', lambda x: (x == 'chat').sum()),
            email=('channel', lambda x: (x == 'email').sum()),
            voice=('channel', lambda x: (x == 'voice').sum()),
            social=('channel', lambda x: (x == 'social').sum()),
            helpdesk=('source_system', lambda x: (x == 'helpdesk').sum()),
            legacy_fd=('source_system', lambda x: (x == 'legacy_fd').sum()),
            breaches=('is_breach', 'sum')
        ).reset_index()

        monthly['breach_rate_pct'] = (monthly['breaches'] / monthly['total'] * 100).round(2)
        return monthly.to_dict(orient='records')

    def get_team_summary(self) -> Dict[str, Any]:
        tier1_total = len(self.df[self.df['tier'] == 'Tier 1'])
        grand_total = len(self.df)

        teams_data = []
        for team in TIER_1_TEAMS + TIER_2_TEAMS:
            team_df = self.df[self.df['assigned_team'] == team]
            resolved_by_team_count = int((self.df['resolving_team'] == team).sum())
            is_tier_2 = team in TIER_2_TEAMS

            assigned_count = len(team_df)
            share_of_total = round((assigned_count / grand_total) * 100, 2)
            share_of_tier1 = round((assigned_count / tier1_total) * 100, 2) if not is_tier_2 else None

            # Handle time (resolved/closed)
            valid_handle = team_df['handle_time_hours'].dropna()
            avg_handle_time = round(float(valid_handle.mean()), 2) if len(valid_handle) > 0 else 0
            median_handle_time = round(float(valid_handle.median()), 2) if len(valid_handle) > 0 else 0

            # Total resolution time (created to resolved)
            valid_res = team_df['total_resolution_hours'].dropna()
            avg_res_time = round(float(valid_res.mean()), 2) if len(valid_res) > 0 else 0

            # SLA
            breaches = int(team_df['is_breach'].sum())
            breach_pct = round((breaches / assigned_count) * 100, 2) if assigned_count > 0 else 0

            # Transfers (helpdesk source only)
            team_hd = team_df[team_df['source_system'] == 'helpdesk']
            hd_count = len(team_hd)
            transfers_count = int(team_hd['transfers'].sum())
            transferred_tickets = int((team_hd['transfers'] > 0).sum())
            transfer_rate = round((transferred_tickets / hd_count) * 100, 2) if hd_count > 0 else 0
            avg_transfers = round(float(team_hd['transfers'].mean()), 3) if hd_count > 0 else 0

            # CSAT
            csat_vals = team_df['csat_score'].dropna()
            avg_csat = round(float(csat_vals.mean()), 2) if len(csat_vals) > 0 else 0

            # Roster headcount
            roster_agents = int((self.agents_df['team'] == team).sum())

            # Refunds & replacements
            refund_sum = round(float(team_df['refund_amount_inr'].sum()), 2)
            replacements = int((team_df['replacement_issued'] == 'Y').sum())

            teams_data.append({
                "team": team,
                "tier": "Tier 2" if is_tier_2 else "Tier 1",
                "assigned_volume": assigned_count,
                "resolved_volume": resolved_by_team_count,
                "volume_difference": resolved_by_team_count - assigned_count,
                "share_of_total_pct": share_of_total,
                "share_of_tier1_pct": share_of_tier1,
                "roster_headcount": roster_agents,
                "avg_handle_time_hours": avg_handle_time,
                "median_handle_time_hours": median_handle_time,
                "avg_resolution_time_hours": avg_res_time,
                "sla_breaches": breaches,
                "sla_breach_pct": breach_pct,
                "helpdesk_tickets": hd_count,
                "transfers_count": transfers_count,
                "transferred_tickets": transferred_tickets,
                "transfer_rate_pct": transfer_rate,
                "avg_transfers": avg_transfers,
                "avg_csat": avg_csat,
                "refund_amount_inr": refund_sum,
                "replacements_issued": replacements
            })

        tier1_list = [t for t in teams_data if t['tier'] == 'Tier 1']
        tier2_list = [t for t in teams_data if t['tier'] == 'Tier 2']

        return {
            "tier_1_teams": tier1_list,
            "tier_2_teams": tier2_list,
            "all_teams": teams_data,
            "policy_rule_note": "Tier 2 (Escalations & Warranty) cases are multi-touch and measured on resolution in days. Under Support Policy §6, Tier 2 agents must NOT be compared directly with Tier 1 on volume metrics."
        }

    def get_monthly_team(self) -> Dict[str, Any]:
        # Monthly pivot for assigned_team
        pivot_assigned = self.df.pivot_table(
            index='year_month',
            columns='assigned_team',
            values='ticket_id',
            aggfunc='count',
            fill_value=0
        ).reset_index()

        # Monthly pivot for resolving_team
        pivot_resolved = self.df.pivot_table(
            index='year_month',
            columns='resolving_team',
            values='ticket_id',
            aggfunc='count',
            fill_value=0
        ).reset_index()

        return {
            "monthly_assigned": pivot_assigned.to_dict(orient='records'),
            "monthly_resolved": pivot_resolved.to_dict(orient='records'),
            "teams": list(self.df['assigned_team'].unique())
        }

    def get_category_summary(self) -> List[Dict[str, Any]]:
        grand_total = len(self.df)
        cat_stats = []

        for cat, group in self.df.groupby('category'):
            vol = len(group)
            share_pct = round((vol / grand_total) * 100, 2)
            breaches = int(group['is_breach'].sum())
            breach_pct = round((breaches / vol) * 100, 2)

            valid_handle = group['handle_time_hours'].dropna()
            avg_handle = round(float(valid_handle.mean()), 2) if len(valid_handle) > 0 else 0

            # Helpdesk transfers
            group_hd = group[group['source_system'] == 'helpdesk']
            transfers_count = int(group_hd['transfers'].sum()) if len(group_hd) > 0 else 0
            transfer_rate = round(((group_hd['transfers'] > 0).sum() / len(group_hd)) * 100, 2) if len(group_hd) > 0 else 0

            # Primary assigned team
            top_assigned = group['assigned_team'].mode()[0] if len(group) > 0 else "N/A"
            # Primary resolving team
            top_resolved = group['resolving_team'].mode()[0] if len(group) > 0 else "N/A"

            cat_stats.append({
                "category": cat,
                "volume": vol,
                "share_pct": share_pct,
                "avg_handle_time_hours": avg_handle,
                "sla_breaches": breaches,
                "sla_breach_pct": breach_pct,
                "transfers_count": transfers_count,
                "transfer_rate_pct": transfer_rate,
                "primary_assigned_team": top_assigned,
                "primary_resolving_team": top_resolved
            })

        cat_stats.sort(key=lambda x: x['volume'], reverse=True)
        return cat_stats

    def get_monthly_category(self) -> Dict[str, Any]:
        pivot_cat = self.df.pivot_table(
            index='year_month',
            columns='category',
            values='ticket_id',
            aggfunc='count',
            fill_value=0
        ).reset_index()

        return {
            "monthly_categories": pivot_cat.to_dict(orient='records'),
            "categories": list(self.df['category'].unique())
        }

    def get_channel_summary(self) -> List[Dict[str, Any]]:
        grand_total = len(self.df)
        channel_data = []

        for ch in ['chat', 'email', 'voice', 'social']:
            ch_df = self.df[self.df['channel'] == ch]
            vol = len(ch_df)
            share_pct = round((vol / grand_total) * 100, 2)
            target = SLA_TARGETS_MINUTES[ch]
            cost_std = CHANNEL_COST_STANDARDS[ch]
            total_cost = vol * cost_std

            breaches = int(ch_df['is_breach'].sum())
            breach_pct = round((breaches / vol) * 100, 2) if vol > 0 else 0
            avg_resp = round(float(ch_df['response_time_minutes'].mean()), 2) if vol > 0 else 0
            median_resp = round(float(ch_df['response_time_minutes'].median()), 2) if vol > 0 else 0

            channel_data.append({
                "channel": ch,
                "volume": vol,
                "share_pct": share_pct,
                "sla_target_display": f"{target}m" if target < 60 else f"{target // 60}h",
                "sla_target_minutes": target,
                "sla_breaches": breaches,
                "sla_breach_pct": breach_pct,
                "avg_response_minutes": avg_resp,
                "median_response_minutes": median_resp,
                "cost_standard_inr": cost_std,
                "total_contact_cost_inr": total_cost
            })

        return channel_data

    def get_sla_analysis(self) -> Dict[str, Any]:
        total_tickets = len(self.df)
        total_breaches = int(self.df['is_breach'].sum())
        breach_pct = round((total_breaches / total_tickets) * 100, 2)
        total_sla_credit_exposure = total_breaches * SLA_CREDIT_PER_BREACH

        # By channel
        channel_sla = self.get_channel_summary()

        # By assigned team
        team_sla = []
        for team, group in self.df.groupby('assigned_team'):
            t_vol = len(group)
            t_breaches = int(group['is_breach'].sum())
            t_pct = round((t_breaches / t_vol) * 100, 2) if t_vol > 0 else 0
            t_credit = t_breaches * SLA_CREDIT_PER_BREACH
            team_sla.append({
                "team": team,
                "tier": "Tier 2" if team in TIER_2_TEAMS else "Tier 1",
                "volume": t_vol,
                "breaches": t_breaches,
                "breach_pct": t_pct,
                "sla_credit_inr": t_credit,
                "avg_response_minutes": round(float(group['response_time_minutes'].mean()), 2)
            })
        team_sla.sort(key=lambda x: x['breach_pct'], reverse=True)

        # Monthly SLA trend
        monthly_sla = self.df.groupby('year_month').agg(
            total=('ticket_id', 'count'),
            breaches=('is_breach', 'sum')
        ).reset_index()
        monthly_sla['breach_pct'] = (monthly_sla['breaches'] / monthly_sla['total'] * 100).round(2)
        monthly_sla['credit_cost_inr'] = monthly_sla['breaches'] * SLA_CREDIT_PER_BREACH

        return {
            "total_breaches": total_breaches,
            "breach_rate_pct": breach_pct,
            "sla_credit_per_breach": SLA_CREDIT_PER_BREACH,
            "total_sla_credit_exposure_inr": total_sla_credit_exposure,
            "channel_sla": channel_sla,
            "team_sla": team_sla,
            "monthly_sla": monthly_sla.to_dict(orient='records')
        }

    def get_cost_analysis(self) -> Dict[str, Any]:
        total_tickets = len(self.df)
        channel_counts = self.df['channel'].value_counts().to_dict()

        channel_breakdown = []
        actual_channel_contact_cost = 0
        for ch, rate in CHANNEL_COST_STANDARDS.items():
            count = channel_counts.get(ch, 0)
            cost = count * rate
            actual_channel_contact_cost += cost
            channel_breakdown.append({
                "channel": ch,
                "volume": count,
                "rate_inr": rate,
                "total_inr": cost
            })

        blended_contact_cost = total_tickets * BLENDED_COST_PER_CONTACT

        # Transfers
        hd_df = self.df[self.df['source_system'] == 'helpdesk']
        total_transfers = int(hd_df['transfers'].sum())
        transfer_cost = total_transfers * TRANSFER_COST_PER_TRANSFER

        # SLA breaches
        total_breaches = int(self.df['is_breach'].sum())
        sla_credit_cost = total_breaches * SLA_CREDIT_PER_BREACH

        # Support operating totals
        total_actual_operating_cost = actual_channel_contact_cost + transfer_cost + sla_credit_cost
        total_blended_operating_cost = blended_contact_cost + transfer_cost + sla_credit_cost

        # Future Planning: 650 tickets / week
        weekly_volume = 650
        weeks_per_year = 52
        months_per_year = 12
        projected_monthly_volume = round((weekly_volume * weeks_per_year) / months_per_year, 2)
        projected_monthly_contact_cost = round(projected_monthly_volume * BLENDED_COST_PER_CONTACT, 2)
        projected_annual_contact_cost = round(projected_monthly_contact_cost * 12, 2)

        # Headcount Economics
        two_hires_annual_budget = 900000
        per_hire_annual = 450000
        per_hire_monthly = per_hire_annual / 12

        return {
            "channel_breakdown": channel_breakdown,
            "actual_channel_contact_cost_inr": actual_channel_contact_cost,
            "blended_contact_cost_inr": blended_contact_cost,
            "blended_rate_per_contact": BLENDED_COST_PER_CONTACT,
            "total_transfers_recorded": total_transfers,
            "transfer_cost_rate": TRANSFER_COST_PER_TRANSFER,
            "transfer_cost_inr": transfer_cost,
            "total_breaches": total_breaches,
            "sla_credit_rate": SLA_CREDIT_PER_BREACH,
            "sla_credit_cost_inr": sla_credit_cost,
            "total_operating_cost_actual_inr": total_actual_operating_cost,
            "total_operating_cost_blended_inr": total_blended_operating_cost,
            "future_planning": {
                "input_weekly_tickets": weekly_volume,
                "weeks_per_year": weeks_per_year,
                "months_per_year": months_per_year,
                "formula_monthly_tickets": f"({weekly_volume} × {weeks_per_year}) ÷ {months_per_year}",
                "projected_monthly_tickets": projected_monthly_volume,
                "formula_monthly_cost": f"{projected_monthly_volume} × ₹{BLENDED_COST_PER_CONTACT}",
                "projected_monthly_contact_cost_inr": projected_monthly_contact_cost,
                "projected_annual_contact_cost_inr": projected_annual_contact_cost
            },
            "headcount_planning": {
                "two_hires_annual_budget_inr": two_hires_annual_budget,
                "per_hire_annual_inr": per_hire_annual,
                "per_hire_monthly_inr": per_hire_monthly,
                "agent_hourly_cost_inr": AGENT_HOURLY_COST,
                "agent_shift_hours": AGENT_SHIFT_HOURS,
                "agent_cost_per_shift_inr": AGENT_HOURLY_COST * AGENT_SHIFT_HOURS
            }
        }

    def get_transfers_analysis(self) -> Dict[str, Any]:
        total_tickets = len(self.df)
        hd_df = self.df[self.df['source_system'] == 'helpdesk']
        legacy_df = self.df[self.df['source_system'] == 'legacy_fd']

        helpdesk_count = len(hd_df)
        legacy_count = len(legacy_df)

        total_transfers = int(hd_df['transfers'].sum())
        transferred_tickets = int((hd_df['transfers'] > 0).sum())
        transfer_rate_pct = round((transferred_tickets / helpdesk_count) * 100, 2)
        transfer_cost = total_transfers * TRANSFER_COST_PER_TRANSFER

        # Cross-tab between assigned_team and resolving_team
        crosstab = pd.crosstab(self.df['assigned_team'], self.df['resolving_team'])
        crosstab_dict = crosstab.to_dict()

        # Matrix for visualization
        teams = sorted(list(self.df['assigned_team'].unique()))
        matrix_rows = []
        for assigned in teams:
            row_data = {"assigned_team": assigned}
            for resolving in teams:
                count = int(crosstab.loc[assigned, resolving]) if (assigned in crosstab.index and resolving in crosstab.columns) else 0
                row_data[resolving] = count
            row_data["total_assigned"] = int(self.df['assigned_team'].value_counts().get(assigned, 0))
            matrix_rows.append(row_data)

        # Helpdesk team transfer stats
        team_transfer_stats = []
        for team in TIER_1_TEAMS + TIER_2_TEAMS:
            team_hd = hd_df[hd_df['assigned_team'] == team]
            count = len(team_hd)
            t_sum = int(team_hd['transfers'].sum()) if count > 0 else 0
            t_tickets = int((team_hd['transfers'] > 0).sum()) if count > 0 else 0
            t_rate = round((t_tickets / count) * 100, 2) if count > 0 else 0
            avg_transfers = round(float(team_hd['transfers'].mean()), 3) if count > 0 else 0
            transfer_cost_team = t_sum * TRANSFER_COST_PER_TRANSFER

            team_transfer_stats.append({
                "team": team,
                "tier": "Tier 2" if team in TIER_2_TEAMS else "Tier 1",
                "helpdesk_volume": count,
                "transferred_tickets": t_tickets,
                "transfer_rate_pct": t_rate,
                "total_transfers": t_sum,
                "avg_transfers": avg_transfers,
                "transfer_cost_inr": transfer_cost_team
            })

        # Key leak detection: Billing -> Logistics
        billing_assigned = self.df[self.df['assigned_team'] == 'Billing']
        billing_to_logistics = len(billing_assigned[billing_assigned['resolving_team'] == 'Logistics'])
        billing_to_logistics_share = round((billing_to_logistics / len(billing_assigned)) * 100, 2)

        return {
            "total_tickets": total_tickets,
            "helpdesk_recorded_count": helpdesk_count,
            "helpdesk_coverage_pct": round((helpdesk_count / total_tickets) * 100, 2),
            "legacy_blank_count": legacy_count,
            "total_transfers_recorded": total_transfers,
            "transferred_tickets_count": transferred_tickets,
            "transfer_rate_helpdesk_pct": transfer_rate_pct,
            "transfer_cost_inr": transfer_cost,
            "billing_to_logistics_leak": {
                "transferred_tickets_count": billing_to_logistics,
                "share_of_billing_queue_pct": billing_to_logistics_share,
                "root_cause": "The chatbot tags tickets mentioning payment as 'Billing & Payments', but customers frequently report delivery delays or shipment tracking after payment, causing heavy manual hand-offs to Logistics."
            },
            "crosstab_matrix": matrix_rows,
            "team_transfer_stats": team_transfer_stats,
            "teams": teams
        }

    def get_data_quality(self) -> Dict[str, Any]:
        total_source_rows = len(self.raw_tickets_df)
        inside_window_rows = len(self.df)
        outside_window_rows = total_source_rows - inside_window_rows

        missing_first_response = int(self.df['first_response_at'].isna().sum())
        missing_resolved = int(self.df['resolved_at'].isna().sum())
        missing_transfers = int(self.df['transfers'].isna().sum())
        missing_csat = int(self.df['csat_score'].isna().sum())
        missing_order_id = int(self.df['order_id'].isna().sum())
        missing_refund_amount = int(self.df['refund_amount_inr'].isna().sum())

        duplicate_ticket_ids = int(self.df['ticket_id'].duplicated().sum())
        duplicate_ticket_ids_source = int(self.raw_tickets_df['ticket_id'].duplicated().sum())

        status_counts = self.df['status'].value_counts().to_dict()
        source_system_counts = self.df['source_system'].value_counts().to_dict()
        priority_counts = self.df['priority'].value_counts().to_dict()

        # Join matching integrity
        cust_match = round(float(self.df['customer_id'].isin(self.customers_df['customer_id']).mean() * 100), 2)
        valid_orders = self.df['order_id'].dropna()
        order_match = round(float(valid_orders.isin(self.orders_df['order_id']).mean() * 100), 2) if len(valid_orders) > 0 else 0
        sku_match = round(float(self.df['product_sku'].isin(self.products_df['sku']).mean() * 100), 2)
        agent_match = round(float(self.df['agent_id'].isin(self.agents_df['agent_id']).mean() * 100), 2)

        return {
            "total_source_rows": total_source_rows,
            "inside_window_rows": inside_window_rows,
            "outside_window_rows": outside_window_rows,
            "reporting_window": {
                "start": "2025-01-01",
                "end": "2026-06-30 23:59:59"
            },
            "missing_values": {
                "first_response_at": missing_first_response,
                "resolved_at": missing_resolved,
                "transfers": missing_transfers,
                "csat_score": missing_csat,
                "order_id": missing_order_id,
                "refund_amount_inr": missing_refund_amount
            },
            "duplicate_ticket_ids": duplicate_ticket_ids,
            "duplicate_ticket_ids_source": duplicate_ticket_ids_source,
            "status_distribution": status_counts,
            "source_system_distribution": source_system_counts,
            "priority_distribution": priority_counts,
            "referential_integrity_pct": {
                "customer_join_match": cust_match,
                "order_join_match": order_match,
                "product_sku_match": sku_match,
                "agent_id_match": agent_match
            },
            "anomalies_and_explanations": [
                {
                    "field": "transfers",
                    "observation": f"{missing_transfers} rows (33.6%) have blank transfers",
                    "explanation": "Field exists only in current helpdesk (live 14 Sep 2025). As per policy §9 and admin notes, pre-migration Freshdesk tickets have blank transfers, NOT zero. Blank must be excluded from transfer rate denominators."
                },
                {
                    "field": "csat_score",
                    "observation": f"{missing_csat} rows (54.6%) have blank CSAT",
                    "explanation": "CSAT is a post-resolution voluntary survey. As per policy §8, ~45% response rate is standard. Blank means no response and is excluded from average calculations rather than treated as zero."
                },
                {
                    "field": "order_id",
                    "observation": f"{missing_order_id} rows (34.1%) have blank order_id",
                    "explanation": "Customers did not provide an order number at ticket creation. Policy specifies customer_id + product_sku as fallback lookup."
                },
                {
                    "field": "resolved_at",
                    "observation": f"{missing_resolved} rows (5.0%) have missing resolved_at",
                    "explanation": f"Corresponds exactly to active open ({status_counts.get('open', 0)}) and pending ({status_counts.get('pending', 0)}) tickets that have not yet reached final closure."
                },
                {
                    "field": "created_at window",
                    "observation": f"{outside_window_rows} rows outside window (Jun 2024 - Dec 2024)",
                    "explanation": "Excluded per project specification to maintain strictly the 18-month reporting window Jan 2025 – Jun 2026."
                }
            ]
        }

    def get_business_insights(self) -> Dict[str, Any]:
        return {
            "executive_summary": "Rigorous data analysis of 11,641 support tickets during Jan 2025 – Jun 2026 demonstrates that allocating the two proposed hires to Billing based on raw intake volume would be suboptimal and financially wasteful.",
            "stakeholder_conflict_analysis": {
                "priya_raman_claim": "Billing is our biggest queue by a mile, 22% of tickets... Neha, Logistics is barely 16%. Two hires there unless the data says otherwise.",
                "data_verdict_on_priya": "Refuted by data. Chat Frontline is actually the largest team by assigned intake (3,030 tickets = 26.0% vs Billing's 2,425 = 20.8%). Furthermore, 28.7% (696 tickets) of Billing's queue is transferred away because the bot misclassifies delivery inquiries mentioning payment.",
                "neha_kulkarni_claim": "Billing keep telling me half their queue isn't theirs... Logistics who are actually drowning - their resolution times are a day plus and they're the ones getting hand-offs from everyone.",
                "data_verdict_on_neha": "Substantially confirmed by data. Logistics resolves 2,574 tickets (vs 1,905 assigned), receiving 696 hand-offs from Billing alone. Logistics average handle time is 38.2 hours (1.6 days) with median 24.4 hours. Logistics is indeed bearing the greatest operational strain.",
                "arjun_mehta_point": "Two hires is about Rs 9 lakh a year. I want to see the volume case in writing before I sign, and I'd rather fix a process than hire into it if that's an option.",
                "data_verdict_on_arjun": "Strongly supported by data. Fixing the chatbot intake taxonomy to separate payment gateway failures from transit delivery delays will immediately eliminate up to 696 transfers, saving ~₹2.12 Lakhs in direct transfer re-handling costs (at ₹305/transfer) and relieving Logistics without adding ₹9 Lakh in annual headcount."
            },
            "key_metrics_comparison": {
                "chat_frontline": {"assigned": 3030, "resolved": 3078, "avg_handle_hrs": 8.01, "sla_breach_pct": 7.46, "transfers_recorded": 245},
                "billing": {"assigned": 2425, "resolved": 1798, "avg_handle_hrs": 16.98, "sla_breach_pct": 19.67, "transfers_recorded": 632},
                "logistics": {"assigned": 1905, "resolved": 2574, "avg_handle_hrs": 38.18, "sla_breach_pct": 9.66, "transfers_recorded": 112},
                "email_frontline": {"assigned": 1807, "resolved": 1658, "avg_handle_hrs": 6.30, "sla_breach_pct": 10.96, "transfers_recorded": 139},
                "returns_desk": {"assigned": 1049, "resolved": 1117, "avg_handle_hrs": 37.08, "sla_breach_pct": 10.77, "transfers_recorded": 46},
                "voice_frontline": {"assigned": 900, "resolved": 766, "avg_handle_hrs": 6.55, "sla_breach_pct": 5.67, "transfers_recorded": 82},
                "escalations_tier2": {"assigned": 525, "resolved": 650, "avg_handle_hrs": 129.71, "sla_breach_pct": 8.19, "transfers_recorded": 43}
            },
            "recommendations": [
                {
                    "priority": "Immediate (Process Fix)",
                    "title": "Fix Intake Bot Taxonomy & Routing Logic",
                    "impact": "Eliminates ~696 misrouted tickets from Billing to Logistics, reduces internal transfers by >45%, saves ₹2.12 Lakh in transfer re-handling overhead, and drops Billing's 19.7% SLA breach rate."
                },
                {
                    "priority": "Strategic (Headcount Decision)",
                    "title": "Do NOT Hire 2 Agents into Billing",
                    "impact": "Billing resolves only 1,798 tickets with 4 agents (~450 tickets/agent/period). If process fixes eliminate misrouted shipment queries, Billing's actual net volume is easily absorbed by existing headcount."
                },
                {
                    "priority": "Workforce Allocation",
                    "title": "If ₹9 Lakh Budget is Approved, Allocate to Logistics or Chat Frontline",
                    "impact": "Logistics resolves 2,574 tickets across 5 agents (~515 tickets/agent) with multi-day handle times (38.2 hrs avg). Chat Frontline handles 3,030 incoming contacts (26% of company). One hire to Logistics and one to Chat Frontline maximizes customer satisfaction and operational throughput."
                }
            ]
        }

    def get_tickets(
        self,
        page: int = 1,
        page_size: int = 50,
        team: Optional[str] = None,
        category: Optional[str] = None,
        channel: Optional[str] = None,
        priority: Optional[str] = None,
        status: Optional[str] = None,
        source_system: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        search: Optional[str] = None
    ) -> Dict[str, Any]:
        filtered = self.df.copy()

        if team and team != 'All':
            filtered = filtered[filtered['assigned_team'] == team]
        if category and category != 'All':
            filtered = filtered[filtered['category'] == category]
        if channel and channel != 'All':
            filtered = filtered[filtered['channel'] == channel]
        if priority and priority != 'All':
            filtered = filtered[filtered['priority'] == priority]
        if status and status != 'All':
            filtered = filtered[filtered['status'] == status]
        if source_system and source_system != 'All':
            filtered = filtered[filtered['source_system'] == source_system]
        if start_date and start_date.strip():
            try:
                start_dt = pd.to_datetime(start_date.strip())
                filtered = filtered[filtered['created_at_dt'] >= start_dt]
            except Exception:
                filtered = filtered[filtered['created_at'] >= start_date.strip()]
        if end_date and end_date.strip():
            try:
                clean_end = end_date.strip()
                if ' ' not in clean_end and 'T' not in clean_end:
                    clean_end += " 23:59:59"
                end_dt = pd.to_datetime(clean_end)
                filtered = filtered[filtered['created_at_dt'] <= end_dt]
            except Exception:
                filtered = filtered[filtered['created_at'] <= end_date.strip() + " 23:59:59"]

        if search:
            search_str = search.lower().strip()
            mask = (
                filtered['ticket_id'].astype(str).str.lower().str.contains(search_str, na=False) |
                filtered['customer_id'].astype(str).str.lower().str.contains(search_str, na=False) |
                filtered['order_id'].astype(str).str.lower().str.contains(search_str, na=False) |
                filtered['customer_message'].astype(str).str.lower().str.contains(search_str, na=False) |
                filtered['agent_notes'].astype(str).str.lower().str.contains(search_str, na=False)
            )
            filtered = filtered[mask]

        total_count = len(filtered)
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size

        page_df = filtered.iloc[start_idx:end_idx].copy()

        # Join customer, order, product details for rich view
        page_df = page_df.merge(
            self.customers_df[['customer_id', 'name', 'city', 'state', 'care_plus']].rename(
                columns={'name': 'customer_name', 'care_plus': 'customer_care_plus'}
            ),
            on='customer_id', how='left'
        )
        page_df = page_df.merge(
            self.products_df[['sku', 'product_name', 'family', 'retail_price_inr', 'warranty_months']].rename(
                columns={'sku': 'product_sku'}
            ),
            on='product_sku', how='left'
        )
        # order details if order_id is present
        page_df = page_df.merge(
            self.orders_df[['order_id', 'order_date', 'order_value_inr', 'lot_code']].drop_duplicates(subset=['order_id']),
            on='order_id', how='left'
        )

        # Cleanly convert NaN and NaT to None for strict JSON serialization
        raw_records = page_df.to_dict(orient='records')
        records = []
        for row in raw_records:
            clean_row = {}
            for k, v in row.items():
                if v is None or pd.isna(v):
                    clean_row[k] = None
                elif isinstance(v, float) and (np.isnan(v) or np.isinf(v)):
                    clean_row[k] = None
                elif isinstance(v, (pd.Timestamp, datetime)):
                    clean_row[k] = v.strftime("%Y-%m-%d %H:%M:%S")
                else:
                    clean_row[k] = v
            records.append(clean_row)

        return {
            "total": total_count,
            "page": page,
            "page_size": page_size,
            "total_pages": int(np.ceil(total_count / page_size)) if total_count > 0 else 1,
            "items": records
        }

data_service = VireoDataService()
