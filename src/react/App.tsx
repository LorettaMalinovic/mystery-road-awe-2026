import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { DashboardPage } from "./pages/DashboardPage";
import { EvidencePage } from "./pages/EvidencePage";
import { PeoplePage } from "./pages/PeoplePage";
import { TimelinePage } from "./pages/TimelinePage";
import { WorkspacePage } from "./pages/WorkspacePage";
import { useHashView } from "./useHashView";
import { useCaseData, type LoadState } from "./useCaseData";
import type { ViewId } from "./routes";

const renderPage = (view: ViewId, loaded: LoadState) => {
  if (loaded.status === "loading") return <p>Loading case file...</p>;
  if (loaded.status === "error") return <p>Could not load the case: {loaded.message}</p>;
  const data = loaded.data;

  switch (view) {
    case "dashboard":
      return <DashboardPage data={data} />;
    case "evidence":
      return <EvidencePage data={data} />;
    case "people":
      return <PeoplePage data={data} />;
    case "timeline":
      return <TimelinePage data={data} />;
    case "workspace":
      return <WorkspacePage data={data} />;
  }
};

export const App = () => {
  const currentView = useHashView();
  const loaded = useCaseData();

  return (
    <>
      <Header currentView={currentView} />
      <main className="app-main">{renderPage(currentView, loaded)}</main>
      <Footer />
    </>
  );
};
