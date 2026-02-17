function Error({ statusCode }) {
  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>{statusCode ?? "Error"}</h1>
      <p>{statusCode === 404 ? "Page not found." : "Something went wrong."}</p>
    </main>
  );
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
