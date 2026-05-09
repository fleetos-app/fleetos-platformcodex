import { LoadingState } from "../../../components/states";

export default function AppLoading() {
  return (
    <div className="content-shell">
      <LoadingState label="Loading workspace" />
    </div>
  );
}
