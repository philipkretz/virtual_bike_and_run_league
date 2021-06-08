const NotFound = Vue.component('Footer', {
  template: `
    <main id="content-container" role="main" class="container">
      <div class="jumbotron">
        <h1>404 - Seite nicht gefunden</h1>
        <p className="lead">Etwas lief schief...</p>
        <router-link class="btn btn-lg btn-link" to="/" role="button">Zurück</router-link>
      </div>
    </main>
  `
});


export default NotFound;
