//export const navigateTo = (viewName) => {
  //const unusedVar = "test";
  //window.location.hash = viewName;
//};

//Demo 5
export const navigateTo = (viewName: string): void => {
  window.location.hash = viewName;
  //navigateTo(123); //demo 5 last point 
};