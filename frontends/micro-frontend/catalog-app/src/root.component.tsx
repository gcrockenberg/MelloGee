export default function Root(props) {
  return (
    <section>
      {props.name} is mounted! 
      <br />
      <a href="#/welcome">Go to single-spa welcome</a>
      <br />
      <a href="#/angular">Go to Angular app</a>
    </section>
  );
}