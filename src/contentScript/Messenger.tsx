// import React, { useEffect } from "react";
// import ReactDOM from "react-dom";
// import "./contentScript.css";

// const App = () => {
//   useEffect(() => {
//     const root = document.createElement("span");
//     const observer = new MutationObserver((mutations) => {
//       for (let mutation of mutations) {
//         if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
//           const targetElement = document.querySelector(
//             '[aria-label="Thread composer"]'
//           );
//           if (targetElement) {
//             const pElement = targetElement.querySelector(".x78zum5");
//             if (pElement) {
//               pElement.appendChild(root);
//               ReactDOM.render(<InjectMessenger />, root);
//               observer.disconnect();
//               break;
//             }
//           }
//         }
//       }
//     });
//     observer.observe(document.body, { childList: true, subtree: true });
//     return () => observer.disconnect();
//   }, []);

//   return null;
// };

// const InjectMessenger = () => {
//   return (
//     <div id="Messenger">
//       <h1>Messenger Component Loaded</h1>
//     </div>
//   );
// };

// const root = document.createElement("div");
// document.body.appendChild(root);
// ReactDOM.render(<App />, root);
