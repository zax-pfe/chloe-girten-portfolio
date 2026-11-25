import Inner from "@/components/Layout/Inner/Inner";

// `modal`: the piece panel (@modal slot), outside the page panel so the blur drawn over the
// page panel (PieceBlur) stays under it.
export default function PagesLayout({ children, modal }) {
  return (
    <>
      <Inner>{children}</Inner>
      {modal}
    </>
  );
}
