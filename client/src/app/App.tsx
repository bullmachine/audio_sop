import { HashRouter as Router } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import AppRoutes from "./router";
import store from "../store/store";
import { Provider } from "react-redux";
import GlobalLoader from "../shared/component/GlobalLoader";

function App() {
  return (
    <Provider store={store}>
      <Router>
        <ToastContainer
          position="top-right"
          autoClose={1200}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          style={{
            position: 'fixed',
            top: '1rem',
            right: '1rem',
            zIndex: 100000, 
            marginTop: '0',
          }}
          toastClassName="dark:!bg-gray-800 dark:!text-white dark:!border-gray-600 dark:!shadow-gray-700 dark:!shadow-lg"
          progressClassName="!bg-blue-500"
        />
        <AppRoutes />
        <GlobalLoader overlay={true} />
      </Router>
    </Provider>
  );
}

export default App;
