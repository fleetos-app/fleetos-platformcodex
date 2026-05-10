import { LoadingState } from "../../components/states";

export default function AdminLoading() {
  return (
    <div className="content-shell">
      <LoadingState label="Loading admin workspace" />
    </div>
  );
}
