function createElement(elementType, classes, otherAttributes) {
  const element = document.createElement(elementType);
  element.classList.add(...classes);
  for (let [key, value] of Object.entries(otherAttributes)) {
    element.setAttribute(key, value);
  }
  return element;
}

export { createElement };
