import { render } from "preact";

import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App from "@ui/App";

export const router = createBrowserRouter([
    { path: "*", element: <App /> }
]);

render(
    <RouterProvider router={router} />,
    document.getElementById("root")!
);
