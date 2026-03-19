import React, { useEffect, useRef } from 'react';
import { useEmployees, useHoursSummary } from '../hooks';
import { Spinner, Card, Empty } from '../components/UI';

function BarChart({ labels, data, colors }) {
  const ref = useRef();

  useEffect(() => {
    if (!window.Chart || !ref.current) return;
    const existing = window.Chart.getChart(ref.current);
    if (existing) existing.destroy();

    new window.Chart(ref.current, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors,
          borderRadius: 6,
          borderSkipped: false,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => ` ${ctx.raw.toFixed(1)}h worked` } },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: { color: '#4b5563', callback: v => v + 'h' },
            border: { color: '#1a1f2e' },
          },
          x: {
            grid: { display: false },
            ticks: { color: '#6b7280', maxRotation: 30 },
            border: { color: '#1a1f2e' },
          },
        },
      },
    });
  // eslint-disable-next-line
  }, [JSON.stringify(labels), JSON.stringify(data)]);

  return <canvas ref={ref} />;
}

function DoughnutChart({ labels, data, colors }) {
  const ref = useRef();

  useEffect(() => {
    if (!window.Chart || !ref.current) return;
    const existing = window.Chart.getChart(ref.current);
    if (existing) existing.destroy();

    new window.Chart(ref.current, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors,
          borderWidth: 3,
          borderColor: '#0f1117',
          hoverOffset: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: { legend: { display: false } },
      },
    });
  // eslint-disable-next-line
  }, [JSON.stringify(data)]);

  return <canvas ref={ref} />;
}

const BAR_COLORS = [
  '#2563eb', '#16a34a', '#d97706', '#7c3aed',
  '#dc2626', '#0891b2', '#c2410c', '#6366f1',
];

export default function Analytics() {
  const { employees, loading: empLoading } = useEmployees();
  const { summary, loading: sumLoading }   = useHoursSummary();

  const loading = empLoading || sumLoading;

  const present = employees.filter(e => e.status === 'present').length;
  const absent  = employees.filter(e => e.status === 'absent').length;
  const late    = employees.filter(e => e.status === 'late').length;
  const leave   = employees.filter(e => e.status === 'leave').length;

  const topPerformers = [...summary].sort((a, b) => b.hours - a.hours);
  const maxHours      = topPerformers[0]?.hours || 1;

  const hourLabels = summary.map(s => s.name.split(' ')[0]);
  const hourData   = summary.map(s => s.hours);

  if (loading) return <Spinner />;

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>

      {/* Hours bar chart */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#e8eaf0' }}>Total Hours Worked per Employee</div>
            <div style={{ fontSize: 12, color: '#4b5563', marginTop: 3 }}>Cumulative hours from all check-in/out logs</div>
          </div>
        </div>

        {/* Custom legend */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          {hourLabels.map((l, i) => (
            <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#6b7280' }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: BAR_COLORS[i % BAR_COLORS.length], display: 'inline-block' }} />
              {l} — {hourData[i]}h
            </span>
          ))}
        </div>

        {hourData.length === 0 ? (
          <Empty message="No hours data yet" hint="Submit check-in and check-out punches to see this chart" />
        ) : (
          <div style={{ position: 'relative', height: Math.max(260, hourLabels.length * 38 + 60) }}>
            <BarChart
              labels={hourLabels}
              data={hourData}
              colors={BAR_COLORS.slice(0, hourData.length)}
            />
          </div>
        )}
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Attendance doughnut */}
        <Card>
          <div style={{ fontSize: 14, fontWeight: 500, color: '#e8eaf0', marginBottom: 2 }}>Attendance Status</div>
          <div style={{ fontSize: 12, color: '#4b5563', marginBottom: 14 }}>Today's distribution across all employees</div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
            {[
              { label: 'Present',  count: present, color: '#4ade80' },
              { label: 'Absent',   count: absent,  color: '#f87171' },
              { label: 'Late',     count: late,    color: '#fb923c' },
              { label: 'On Leave', count: leave,   color: '#c084fc' },
            ].map(row => (
              <span key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#6b7280' }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: row.color, display: 'inline-block' }} />
                {row.label} ({row.count})
              </span>
            ))}
          </div>

          <div style={{ position: 'relative', height: 220 }}>
            <DoughnutChart
              labels={['Present', 'Absent', 'Late', 'On Leave']}
              data={[present, absent, late, leave]}
              colors={['#4ade80', '#f87171', '#fb923c', '#c084fc']}
            />
          </div>

          {/* Centre label */}
          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <div style={{ fontSize: 24, fontWeight: 600, color: '#e8eaf0', fontFamily: "'Syne', sans-serif" }}>
              {employees.length ? Math.round((present / employees.length) * 100) : 0}%
            </div>
            <div style={{ fontSize: 12, color: '#4b5563' }}>attendance rate today</div>
          </div>
        </Card>

        {/* Top performers leaderboard */}
        <Card>
          <div style={{ fontSize: 14, fontWeight: 500, color: '#e8eaf0', marginBottom: 4 }}>Hours Leaderboard</div>
          <div style={{ fontSize: 12, color: '#4b5563', marginBottom: 18 }}>Ranked by total hours logged</div>

          {topPerformers.length === 0 ? (
            <Empty message="No data yet" hint="Hours are calculated from check-in/out pairs" />
          ) : topPerformers.slice(0, 8).map((s, i) => {
            const rankColors = ['#fb923c', '#9ca3af', '#b45309', '#4b5563'];
            const barColor   = i === 0 ? '#fb923c' : i === 1 ? '#9ca3af' : i === 2 ? '#b45309' : '#2563eb';
            return (
              <div key={s.employeeId} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                {/* Rank */}
                <div style={{
                  width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                  background: i < 3 ? `${barColor}22` : '#1a1f2e',
                  color: rankColors[i] || '#4b5563',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 600,
                }}>
                  {i + 1}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 13.5, color: '#e8eaf0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {s.name}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: barColor, marginLeft: 8, flexShrink: 0 }}>
                      {s.hours}h
                    </span>
                  </div>
                  <div style={{ height: 4, background: '#1a1f2e', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      background: barColor,
                      borderRadius: 2,
                      width: `${(s.hours / maxHours) * 100}%`,
                      transition: 'width 0.8s ease',
                    }} />
                  </div>
                </div>
              </div>
            );
          })}
        </Card>
      </div>
    </div>
  );
}
