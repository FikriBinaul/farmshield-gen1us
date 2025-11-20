// pages/_app.js
import { SidebarProvider } from "@/contexts/SidebarContext";
import FallingLeaves from "@/components/LeafAnimation";
import GlobalLoading from "@/components/LoadingScreen";
import "@/styles/globals.css";


export default function App({ Component, pageProps }) {
  return (
    <SidebarProvider>
      <FallingLeaves />
      <Component {...pageProps} />
      <GlobalLoading />
    </SidebarProvider>
  );
}
