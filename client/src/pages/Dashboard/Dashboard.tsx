import CustomBreadcrumb from "../../components/CustomBreadcrumb";

const breadCrumbList = [
  {
    label: "Dashboard",
    path: "/",
  },
];

export default function Dashboard() {
  return (
    <>
      <CustomBreadcrumb list={breadCrumbList} />
    </>
  );
}
