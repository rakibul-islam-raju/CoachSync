import { Box } from "@mui/material";
import { ResponsiveBar } from "@nivo/bar";
import ErrorDisplay from "../../../components/ErrorDisplay/ErrorDisplay";
import Loader from "../../../components/Loader";
import { useGetTransactionStatsQuery } from "../../../redux/transaction/transactionApi";

const MonthlyTransactionBarChart = () => {
  const { data, isLoading, isError, error } =
    useGetTransactionStatsQuery(undefined);

  return isLoading ? (
    <Loader />
  ) : isError ? (
    <ErrorDisplay error={error} />
  ) : (
    data && (
      <Box height={"500px"}>
        <ResponsiveBar
          data={data}
          keys={["month"]}
          indexBy="month"
          margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
          padding={0.3}
          valueScale={{ type: "linear" }}
          indexScale={{ type: "band", round: true }}
          colors={{ scheme: "nivo" }}
          defs={[
            {
              id: "dots",
              type: "patternDots",
              background: "inherit",
              color: "#38bcb2",
              size: 4,
              padding: 1,
              stagger: true,
            },
            {
              id: "lines",
              type: "patternLines",
              background: "inherit",
              color: "#eed312",
              rotation: -45,
              lineWidth: 6,
              spacing: 10,
            },
          ]}
          borderColor={{
            from: "color",
            modifiers: [["darker", 1.6]],
          }}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "month",
            legendPosition: "middle",
            legendOffset: 32,
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "amount",
            legendPosition: "middle",
            legendOffset: -40,
          }}
          labelSkipWidth={12}
          labelSkipHeight={12}
          labelTextColor={{
            from: "color",
            modifiers: [["darker", 1.6]],
          }}
          legends={[
            {
              dataFrom: "keys",
              anchor: "bottom-right",
              direction: "column",
              justify: false,
              translateX: 120,
              translateY: 0,
              itemsSpacing: 2,
              itemWidth: 100,
              itemHeight: 20,
              itemDirection: "left-to-right",
              itemOpacity: 0.85,
              symbolSize: 20,
              effects: [
                {
                  on: "hover",
                  style: {
                    itemOpacity: 1,
                  },
                },
              ],
            },
          ]}
          role="application"
          ariaLabel="Nivo bar chart demo"
          barAriaLabel={e =>
            e.id + ": " + e.formattedValue + " in month: " + e.indexValue
          }
        />
      </Box>
    )
  );
};

export default MonthlyTransactionBarChart;
