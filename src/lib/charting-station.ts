type ChartStation = {
  stationCode: string;
  stationName: string;
  chartRemoteStation: string | null;
};

/** Describe only the charting-station mapping supplied by the backend. */
export function describeChartingStation(
  station: ChartStation,
  route: readonly ChartStation[],
) {
  const code = station.chartRemoteStation?.trim().toUpperCase();
  if (!code) {
    return {
      kind: "unknown" as const,
      display: "Not available",
      label: null,
    };
  }

  const match = route.find((item) => item.stationCode.trim().toUpperCase() === code);
  const name = match?.stationName.trim();
  const self = code === station.stationCode.trim().toUpperCase();
  return {
    kind: self ? ("self" as const) : ("remote" as const),
    display: name ? `${name} (${code})` : code,
    label: self ? "Self charting" : "Remote charting",
  };
}
