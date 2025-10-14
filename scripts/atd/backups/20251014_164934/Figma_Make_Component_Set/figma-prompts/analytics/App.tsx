import { PipelineAnalytics } from "./components/pipeline/PipelineAnalytics";
import { Toaster } from "./components/ui/sonner";

export default function App() {
  return (
    <>
      <PipelineAnalytics
        userId="user-1"
        role="ADMIN"
        defaultPeriod="30days"
        defaultChartType="funnel"
        onStageClick={(stage) => console.log("Stage clicked:", stage)}
      />
      <Toaster position="top-right" />
    </>
  );
}
