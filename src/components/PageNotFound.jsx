import { NotFoundView } from "../error";

export default function PageNotFound() {
  return (
    <>
      <div>
        <title> 404 Page Not Found </title>
      </div>

      <NotFoundView />
    </>
  );
}
