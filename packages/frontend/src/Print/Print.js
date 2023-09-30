import QRCode from "react-qr-code";

function Print() {
  return (
    <div className="Print">
      <header className="Print-header">
        <QRCode
          size={256}
          style={{ height: "auto", maxWidth: "100%", width: "100%" }}
          value={'dadfa'}
          viewBox={`0 0 256 256`}
        />
      </header>
    </div>
  );
}

export default Print;
