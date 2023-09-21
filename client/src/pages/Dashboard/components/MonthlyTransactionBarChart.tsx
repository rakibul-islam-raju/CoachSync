import { Box, Typography } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { ResponsiveBar } from "@nivo/bar";
import dayjs from "dayjs";
import { useState } from "react";
import ErrorDisplay from "../../../components/ErrorDisplay/ErrorDisplay";
import Loader from "../../../components/Loader";
import { useGetTransactionStatsQuery } from "../../../redux/transaction/transactionApi";

const MonthlyTransactionBarChart = () => {
  const [year, setYear] = useState(dayjs(new Date()));

  const { data, isLoading, isError, error } = useGetTransactionStatsQuery(
    Number(year.format("YYYY")),
    {
      skip: !year,
    },
  );

  return isLoading ? (
    <Loader />
  ) : isError ? (
    <ErrorDisplay error={error} />
  ) : (
    data && (
      <Box>
        <Box
          display={"flex"}
          gap={2}
          justifyContent={"space-between"}
          alignItems={"center"}
        >
          <Typography variant="h5">Monthly Transactions</Typography>
          <DatePicker
            label={"Year"}
            views={["year"]}
            value={year}
            onChange={newYear => setYear(dayjs(newYear))}
          />
        </Box>
        <Box height={"500px"}>
          <ResponsiveBar
            data={data}
            keys={["total_amount"]}
            indexBy="month"
            margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
            padding={0.3}
            valueScale={{ type: "linear" }}
            indexScale={{ type: "band", round: true }}
            colors={"rgba(24, 91, 192, 0.8)"}
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
            ]}
            labelSkipWidth={12}
            labelSkipHeight={12}
            labelTextColor={{
              from: "color",
              modifiers: [["brighter", 10]],
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
            ariaLabel="Monthly-transactions"
            barAriaLabel={e =>
              e.data.month +
              ": " +
              e.formattedValue +
              " in month: " +
              e.indexValue
            }
          />
        </Box>
      </Box>
    )
  );
};

export default MonthlyTransactionBarChart;
