(() => {
  const site = window.WAKISHA_SITE;
  if (!site?.content) return;

  const content = site.content;
  const templateConfig = site.templateConfig || {};
  const contact = content.contact || {};
  const get = (path, source = content) =>
    String(path)
      .split('.')
      .reduce((value, key) => (value == null ? undefined : value[key]), source);
  const first = (paths, fallback = '') => {
    for (const path of paths || []) {
      const value = get(path);
      if (Array.isArray(value) && value.length) return value;
      if (value != null && value !== '') return value;
    }
    return fallback;
  };
  const text = (value, fallback = '') => {
    if (Array.isArray(value)) return value.filter(Boolean).join(', ');
    return value == null || value === '' ? fallback : String(value);
  };
  const escape = (value) =>
    text(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  const setText = (selector, value) => {
    const next = text(value);
    if (!next) return;
    document.querySelectorAll(selector).forEach((node) => {
      node.textContent = next;
    });
  };
  const setHtml = (selector, value) => {
    const next = text(value);
    if (!next) return;
    document.querySelectorAll(selector).forEach((node) => {
      node.innerHTML = next;
    });
  };
  const listItems = (items, render) =>
    Array.isArray(items) ? items.filter(Boolean).map(render).join('') : '';
  const renderListItem = (binding, item) => {
    const tag = binding.itemTag || 'span';
    const icon = binding.iconClass
      ? '<i class="' + escape(binding.iconClass) + '"></i>'
      : '';
    const title = escape(binding.titlePath ? get(binding.titlePath, item) : item);
    const eyebrow = escape(binding.eyebrowPath ? get(binding.eyebrowPath, item) : '');
    const body = escape(binding.bodyPath ? get(binding.bodyPath, item) : '');
    const className = binding.itemClass ? ' class="' + escape(binding.itemClass) + '"' : '';

    if (tag === 'span') return '<span' + className + '>' + icon + title + '</span>';
    if (tag === 'li') return '<li' + className + '>' + icon + title + '</li>';
    return (
      '<article' +
      className +
      '>' +
      icon +
      (eyebrow ? '<span>' + eyebrow + '</span>' : '') +
      '<h3>' +
      title +
      '</h3>' +
      (body ? '<p>' + body + '</p>' : '') +
      '</article>'
    );
  };

  window.addEventListener('DOMContentLoaded', () => {
    document.title = text(content.name, document.title);
    (templateConfig.textBindings || []).forEach((binding) => {
      setText(
        binding.selector,
        text(binding.prefix || '') + text(first(binding.paths, binding.fallback)),
      );
    });
    setText('.contact-section p:last-of-type, #contact p:last-of-type', [
      contact.email,
      contact.phone,
      contact.location,
      contact.website,
    ].filter(Boolean).join(' - '));

    (templateConfig.listBindings || []).forEach((binding) => {
      const items = get(binding.path);
      if (!Array.isArray(items) || !items.length) return;
      setHtml(binding.selector, listItems(items, (item) => renderListItem(binding, item)));
    });

    (content.sections || []).forEach((section) => {
      const root = document.getElementById(section.id);
      if (!root) return;
      const heading = root.querySelector('h2');
      const body = Array.from(root.querySelectorAll('p')).find(
        (node) => !node.classList.contains('eyebrow'),
      );
      if (heading && section.title) heading.textContent = text(section.title);
      if (body && section.body) body.textContent = text(section.body);

      if (Array.isArray(section.items) && section.items.length) {
        const listRoot =
          root.querySelector('[class$="-grid"]') ||
          root.querySelector('[class$="-cards"]') ||
          root.querySelector('[class$="-list"]');
        if (listRoot) {
          listRoot.innerHTML = listItems(section.items, (item) =>
            renderListItem(
              {
                itemTag: listRoot.tagName.toLowerCase() === 'ol' ? 'li' : 'article',
                iconClass: 'fa-solid fa-circle-check',
                titlePath: 'title',
                bodyPath: 'body',
              },
              item,
            ),
          );
        }
      }
    });

    document.querySelectorAll('a[href="#contact"], .nav-cta').forEach((link) => {
      link.textContent = text(site.content?.cta?.primary, link.textContent);
      if (contact.email) link.setAttribute('href', 'mailto:' + contact.email);
    });
  });
})();

const header = document.querySelector('.site-header');
const toggle = document.querySelector('.menu-toggle');
toggle?.addEventListener('click', () => header?.classList.toggle('is-open'));
document
  .querySelectorAll('a[href^="#"]')
  .forEach((link) =>
    link.addEventListener('click', () => header?.classList.remove('is-open')),
  );
document.querySelectorAll('.current-year').forEach((node) => {
  node.textContent = String(new Date().getFullYear());
});
