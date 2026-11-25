import Inner from "@/components/Layout/Inner/Inner";

// `modal`: the piece panel (@modal slot), outside the page panel so the page panel can be
// blurred, border included, without blurring it.
export default function PagesLayout({ children, modal }) {
  return (
    <>
      <Inner>{children}</Inner>
      {modal}
    </>
  );
}
