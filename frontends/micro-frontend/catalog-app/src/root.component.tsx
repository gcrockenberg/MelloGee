export default function Root(props) {
  return (
    <section>
      <h1>Deployments can take 10 minutes to propagate to CDN</h1>
      {props.name} is mounted! 
      <br />
      <a href="/welcome">Go to single-spa welcome</a>
      <br />
      <a href="/angular">Go to Angular app</a>
    </section>
  );
}