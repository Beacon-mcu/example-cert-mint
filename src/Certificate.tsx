export type Cert = {
  id: number;
  name: string;
  owner: string;
  issued_at: bigint;
};

export default function Certificate({ cert }: { cert: Cert }) {
  const date = new Date(Number(cert.issued_at) * 1000).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      style={{
        marginTop: "1.5rem",
        padding: "clamp(1rem, 5vw, 2rem) .75rem",
        border: "6px double #b08d2f",
        background: "#fffdf5",
        color: "#3a2f10",
        textAlign: "center",
        fontFamily: "Georgia, serif",
      }}
    >
      <div style={{ letterSpacing: ".2em", fontSize: ".8rem" }}>CERTIFICATE #{cert.id}</div>
      <h2 style={{ margin: ".6rem 0" }}>Certificate of Achievement</h2>
      <div>This is presented to</div>
      <div style={{ fontSize: "clamp(1.4rem, 7vw, 2rem)", fontStyle: "italic", margin: ".8rem 0", wordBreak: "break-word" }}>
        {cert.name}
      </div>
      <div style={{ fontSize: ".85rem" }}>Issued {date}</div>
      <div style={{ fontSize: ".7rem", marginTop: ".8rem", wordBreak: "break-all" }}>
        Owner: {cert.owner}
      </div>
    </div>
  );
}
