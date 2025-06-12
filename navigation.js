import { t } from "./i18n.js";

const nav = document.querySelector('.navigation');

const tabs = ['home', 'lessons', 'results', 'settings'];
tabs.forEach(tab => {
  const btn = document.createElement('button');
  btn.classList.add('nav-item');
  btn.dataset.target = tab;
  btn.innerHTML = `<div>${t(tab)}</div>`;
  btn.addEventListener('click', () => showSection(tab));
  nav.appendChild(btn);
});

export function showSection(name) {
  tabs.forEach(tab => {
    document.getElementById(tab).classList.toggle('active', tab === name);
    document.querySelector(`.nav-item[data-target="${tab}"]`).classList.toggle('active', tab === name);
  });
}

window.addEventListener('langChanged', () => {
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.querySelector('div').textContent = t(btn.dataset.target);
  });
});