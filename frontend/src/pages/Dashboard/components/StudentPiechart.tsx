// install (please try to align the version of installed @nivo packages)
// yarn add @nivo/pie
import { Box } from "@mui/material";
import { ResponsivePie } from "@nivo/pie";
import ErrorDisplay from "../../../components/ErrorDisplay/ErrorDisplay";
import Loader from "../../../components/Loader";
import { useGetStudentShortStatsQuery } from "../../../redux/student/studentApi";
import { convertData } from "../../../utils/objToPieObj";
import { pickObj } from "../../../utils/pickObj";

const StudentPiechart = () => {
  const { data, isLoading, isError, error } =
    useGetStudentShortStatsQuery(undefined);

  return isLoading ? (
    <Loader />
  ) : isError ? (
    <ErrorDisplay error={error} />
  ) : (
    data && (
      <Box sx={{ height: "500px" }}>
        <ResponsivePie
          data={convertData(
            pickObj(data, ["students", "active_students", "inactive_students"]),
          )}
          colors={pie => pie.data.color}
          margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
          innerRadius={0.5}
          padAngle={0.7}
          cornerRadius={3}
          activeOuterRadiusOffset={8}
          borderWidth={1}
          borderColor={{
            from: "color",
            modifiers: [["darker", 0.2]],
          }}
          arcLinkLabelsSkipAngle={10}
          arcLinkLabelsTextColor="#333333"
          arcLinkLabelsThickness={2}
          arcLinkLabelsColor={{ from: "color" }}
          arcLabelsSkipAngle={10}
          arcLabelsTextColor={{
            from: "color",
            modifiers: [["brighter", 10]],
          }}
          legends={[
            {
              anchor: "bottom",
              direction: "row",
              justify: false,
              translateX: 0,
              translateY: 56,
              itemsSpacing: 0,
              itemWidth: 100,
              itemHeight: 18,
              itemTextColor: "#999",
              itemDirection: "left-to-right",
              itemOpacity: 1,
              symbolSize: 18,
              symbolShape: "circle",
              effects: [
                {
                  on: "hover",
                  style: {
                    itemTextColor: "#000",
                  },
                },
              ],
            },
          ]}
        />
      </Box>
    )
  );
};

export default StudentPiechart;
