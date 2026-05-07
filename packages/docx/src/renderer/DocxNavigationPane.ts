import type { DocxHeadingNode, DocxNavigation } from '../model';

export interface DocxNavigationPaneOptions {
  navigation: DocxNavigation;
  onHeadingClick: (headingId: string) => void;
}

export function createDocxNavigationPane(options: DocxNavigationPaneOptions): HTMLElement {
  const nav = document.createElement('aside');
  nav.dataset.testid = 'docx-navigation-pane';
  nav.className = 'opr-docx-navigation-pane';

  const navTitle = document.createElement('div');
  navTitle.textContent = '目录';
  navTitle.className = 'opr-docx-navigation-title';
  nav.appendChild(navTitle);

  if (options.navigation.headings.length > 0) {
    nav.appendChild(renderNavigationTree(options.navigation.headings, options.onHeadingClick));
  } else {
    const empty = document.createElement('div');
    empty.textContent = '无标题目录';
    empty.className = 'opr-docx-navigation-empty';
    nav.appendChild(empty);
  }

  return nav;
}

function renderNavigationTree(headings: DocxHeadingNode[], onHeadingClick: (headingId: string) => void): HTMLElement {
  const list = document.createElement('ul');
  list.dataset.testid = 'docx-navigation-tree';
  list.className = 'opr-docx-navigation-tree';

  for (const heading of headings) {
    const item = document.createElement('li');
    item.className = 'opr-docx-navigation-item';

    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = heading.pageIndex === undefined ? heading.text : `${heading.text} · ${heading.pageIndex + 1}`;
    button.dataset.navHeadingId = heading.id;
    button.dataset.headingLevel = String(heading.level);
    button.className = 'opr-docx-navigation-button';
    button.title = heading.text;
    button.onclick = () => onHeadingClick(heading.id);
    item.appendChild(button);

    if (heading.children.length > 0) {
      const childTree = renderNavigationTree(heading.children, onHeadingClick);
      childTree.classList.add('opr-docx-navigation-tree--child');
      item.appendChild(childTree);
    }

    list.appendChild(item);
  }

  return list;
}
