// pages/_app.js
import { SidebarProvider } from "@/contexts/SidebarContext";
import { DarkModeProvider } from "@/contexts/DarkModeContext";
import LeafAnimation from "@/components/LeafAnimation";
import GlobalLoading from "@/components/LoadingScreen";
import "@/styles/globals.css";


export default function App({ Component, pageProps }) {
  return (
    <DarkModeProvider>
      <SidebarProvider>
        <LeafAnimation leafCount={15} speed="normal" />
        <Component {...pageProps} />
        <GlobalLoading />
      </SidebarProvider>
    </DarkModeProvider>
  );
}
