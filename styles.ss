* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  background-color: #f9f9f9;
  color: #111;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* Header (logo markazda) */
header {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 12px;
  background-color: #fff;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 10;
}

header img {
  height: 50px;
  width: auto;
}

/* Asosiy kontent */
main {
  flex-grow: 1;
  padding: 16px;
}

/* Pastki navigatsiya paneli */
nav {
  display: flex;
  justify-content: space-around;
  align-items: center;
  background-color: #fff;
  border-top: 1px solid #ddd;
  padding: 10px 0;
  position: sticky;
  bottom: 0;
  z-index: 10;
}

nav a {
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}

nav svg {
  width: 28px;
  height: 28px;
  stroke: #333;
  transition: 0.3s;
}

nav a.active svg {
  stroke: #007bff;
}

nav svg:hover {
  stroke: #007bff;
  transform: scale(1.1);
}

/* Dark rejim */
@media (prefers-color-scheme: dark) {
  body {
    background-color: #121212;
    color: #eee;
  }
  header, nav {
    background-color: #1e1e1e;
  }
  nav svg {
    stroke: #eee;
  }
}