// Register service worker for PWA
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").then(
      (registration) => {
        console.log("ServiceWorker registration successful with scope: ", registration.scope)
      },
      (err) => {
        console.log("ServiceWorker registration failed: ", err)
      },
    )
  })
}

// PWA install prompt
let deferredPrompt
const installButton = document.getElementById("install-button")

window.addEventListener("beforeinstallprompt", (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault()
  // Stash the event so it can be triggered later
  deferredPrompt = e
  // Show install button
  if (installButton) {
    installButton.style.display = "block"
  }
})

// Installation function to be called by the install button
window.installPWA = () => {
  if (deferredPrompt) {
    // Show the install prompt
    deferredPrompt.prompt()
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === "accepted") {
        console.log("User accepted the install prompt")
      } else {
        console.log("User dismissed the install prompt")
      }
      deferredPrompt = null
      // Hide the install button
      if (installButton) {
        installButton.style.display = "none"
      }
    })
  }
}

