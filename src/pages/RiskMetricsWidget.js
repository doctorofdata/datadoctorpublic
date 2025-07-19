import React, { useState } from "react";
import { Box, Paper, Typography, Grid, Divider, Tabs, Tab, Card, CardContent } from "@mui/material";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import SpeedIcon from "@mui/icons-material/Speed";

// Helper: Explain volatility index numerically for user
function getVolatilityExplanation(vol) {
  if (!isFinite(vol)) return "No data available.";
  if (vol < 0.15)
    return "Low volatility: Portfolio is stable, with smaller price swings and lower risk.";
  if (vol < 0.3)
    return "Moderate volatility: Some price swings; moderate risk and opportunity.";
  return "High volatility: Large price swings; higher risk and greater potential for gain or loss.";
}

// Helper: Explain sharpe ratio numerically for user
function getSharpeExplanation(sharpe) {
  if (!isFinite(sharpe)) return "No data available.";
  if (sharpe < 0.5)
    return "Low Sharpe Ratio: Risk-adjusted return is low; review asset allocation.";
  if (sharpe < 1)
    return "Moderate Sharpe Ratio: Acceptable risk-adjusted return.";
  return "High Sharpe Ratio: Strong risk-adjusted performance.";
}

// Tab panel utility
function TabPanel(props) {
  const { children, value, index } = props;
  return (
    <Box role="tabpanel" hidden={value !== index} sx={{ width: "100%" }}>
      {value === index && <Box sx={{ pt: 1 }}>{children}</Box>}
    </Box>
  );
}

const VolatilityTab = () => (
  <Card
    elevation={2}
    sx={{
      bgcolor: "background.paper",
      color: "text.primary",
      borderRadius: 3,
    }}
  >
    <CardContent>
      <Typography variant="h6" sx={{
        fontWeight: 700,
        color: "primary.main",
        mb: 1,
        display: "flex",
        alignItems: "center",
        gap: 1
      }}>
        <SpeedIcon sx={{ fontSize: 22, color: "primary.main" }} />
        Volatility Index
      </Typography>
      <Typography variant="body2" sx={{ color: "text.secondary", opacity: 0.85 }}>
        The Volatility Index measures how much the portfolio's value fluctuates over time.<br />
        Lower values indicate more stability and less risk, while higher values signal bigger price swings and more risk/opportunity.<br />
        <b>Note:</b> It does <b>not</b> indicate direction, just magnitude of movement.
      </Typography>
    </CardContent>
  </Card>
);

const SharpeTab = () => (
  <Card
    elevation={2}
    sx={{
      bgcolor: "background.paper",
      color: "text.primary",
      borderRadius: 3,
    }}
  >
    <CardContent>
      <Typography variant="h6" sx={{
        fontWeight: 700,
        color: "secondary.main",
        mb: 1,
        display: "flex",
        alignItems: "center",
        gap: 1
      }}>
        <ShowChartIcon sx={{ fontSize: 22, color: "secondary.main" }} />
        Sharpe Ratio
      </Typography>
      <Typography variant="body2" sx={{ color: "text.secondary", opacity: 0.85 }}>
        The Sharpe Ratio is a measure of risk-adjusted return, showing how much excess return your portfolio achieves per unit of risk.<br />
        Higher values mean better reward for the risk taken. Values above 1 are considered strong.
      </Typography>
    </CardContent>
  </Card>
);

/**
 * metrics: array of { ticker: string, volatility: number, sharpe: number }
 */
export default function RiskMetricsWidget({ metrics }) {
  const metricsList = Array.isArray(metrics) ? metrics : [];

  const avgVolatility =
    metricsList.length > 0
      ? metricsList.reduce((acc, m) => acc + (isFinite(m.volatility) ? m.volatility : 0), 0) /
        metricsList.length
      : NaN;
  const avgSharpe =
    metricsList.length > 0
      ? metricsList.reduce((acc, m) => acc + (isFinite(m.sharpe) ? m.sharpe : 0), 0) /
        metricsList.length
      : NaN;

  const [tab, setTab] = useState(0);

  return (
    <Box sx={{
      width: "100%",
      mt: 2,
      mb: 2,
      boxSizing: "border-box",
      display: "flex",
      justifyContent: "center",
      alignItems: "stretch",
    }}>
      <Paper
        elevation={3}
        sx={{
          width: "100%",
          bgcolor: "background.paper",
          borderRadius: 3,
          p: { xs: 2, sm: 3 },
          boxSizing: "border-box",
          border: "1px solid #262730",
          boxShadow: "0 2px 24px rgba(12,15,24,0.13)",
        }}
      >
        <Grid container spacing={4} sx={{ width: "100%", m: 0 }}>
          {/* Left column: Tabs/explanation (approx 35% width) */}
          <Grid item xs={12} md={5} lg={4} sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            gap: 2,
            minWidth: 0,
          }}>
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              orientation="vertical"
              variant="scrollable"
              sx={{
                mb: 2,
                '.MuiTab-root': {
                  textAlign: "left",
                  alignItems: "start",
                  color: "text.secondary",
                  fontWeight: 600,
                  '&.Mui-selected': { color: "primary.main" }
                }
              }}
            >
              <Tab icon={<SpeedIcon />} iconPosition="start" label="Volatility Index" sx={{ minHeight: 56 }} />
              <Tab icon={<ShowChartIcon />} iconPosition="start" label="Sharpe Ratio" sx={{ minHeight: 56 }} />
            </Tabs>
            <TabPanel value={tab} index={0}>
              <VolatilityTab />
            </TabPanel>
            <TabPanel value={tab} index={1}>
              <SharpeTab />
            </TabPanel>
          </Grid>
          {/* Right column: Portfolio Risk & Reward (approx 65% width) */}
          <Grid item xs={12} md={7} lg={8} sx={{
            display: "flex",
            alignItems: "stretch"
          }}>
            <Box sx={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              bgcolor: "background.paper",
              borderRadius: 2,
              p: { xs: 2, sm: 3 },
              boxSizing: "border-box",
              minHeight: 240,
              justifyContent: "center",
              boxShadow: "0 1px 12px rgba(12,15,24,0.07)",
            }}>
              <Typography
                variant="h5"
                align="center"
                sx={{
                  fontWeight: 700,
                  color: "text.primary",
                  mb: 2,
                  letterSpacing: 0.5,
                }}
              >
                Portfolio Risk & Reward <span role="img" aria-label="bar chart">📈</span>
              </Typography>
              <Divider sx={{ mb: 2, bgcolor: "#232338", borderColor: "#232338" }} />
              <Grid container spacing={2} sx={{ width: "100%", m: 0 }} alignItems="stretch" justifyContent="center">
                {/* Volatility Index column */}
                <Grid item xs={12} sm={6}>
                  <Card elevation={1} sx={{ bgcolor: "background.default", borderRadius: 2 }}>
                    <CardContent>
                      <Box sx={{ display: "flex", alignItems: "center", mb: 0.5, gap: 0.7 }}>
                        <SpeedIcon sx={{ fontSize: 19, color: "primary.main", verticalAlign: "middle" }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "primary.main" }}>
                          Volatility Index
                        </Typography>
                      </Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: "primary.main", mb: 0.5 }}>
                        {isFinite(avgVolatility) ? avgVolatility.toFixed(3) : "N/A"}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5, fontSize: "0.98rem", color: "text.secondary", opacity: 0.85 }}>
                        {getVolatilityExplanation(avgVolatility)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                {/* Sharpe Ratio column */}
                <Grid item xs={12} sm={6}>
                  <Card elevation={1} sx={{ bgcolor: "background.default", borderRadius: 2 }}>
                    <CardContent>
                      <Box sx={{ display: "flex", alignItems: "center", mb: 0.5, gap: 0.7 }}>
                        <ShowChartIcon sx={{ fontSize: 19, color: "secondary.main", verticalAlign: "middle" }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "secondary.main" }}>
                          Sharpe Ratio
                        </Typography>
                      </Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: "secondary.main", mb: 0.5 }}>
                        {isFinite(avgSharpe) ? avgSharpe.toFixed(3) : "N/A"}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5, fontSize: "0.98rem", color: "text.secondary", opacity: 0.85 }}>
                        {getSharpeExplanation(avgSharpe)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
