import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Home from './Home/Home';
import Capture from './Capture/Capture';
import Print from './Print/Print';
import Describe from './Describe/Describe';
import Products from './Products/Products';
import Cashier from './Cashier/Cashier';
import Product from './Product/Product';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";


const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/capture",
    element: <Capture />,
  },
  {
    path: "/describe",
    element: <Describe />,
  },
  {
    path: "/print",
    element: <Print />,
  },
  {
    path: "/products",
    element: <Products />,
  },
  {
    path: "/product",
    element: <Product />,
  },
  {
    path: "/cashier",
    element: <Cashier />,
  }
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
ReactDOM.createRoot(document.getElementById("root"))
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
