import localFont from "next/font/local";
import Layout from "@/components/Layout/Layout";
import Providers from "./providers";
import "./globals.css";

const raleway = localFont({
  src: [
    {
      path: "./fonts/Raleway-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Raleway-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/Raleway-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/Raleway-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  display: "swap",
});

export const metadata = {
  title: "Chloe Girten",
  description: "Portfolio of ceramic artist Chloe Girten",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={raleway.className}>
        <Providers>
          <Layout>{children}</Layout>
        </Providers>
      </body>
    </html>
  );
}
