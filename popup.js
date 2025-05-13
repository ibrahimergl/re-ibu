// Object to store all DOM elements and their default values
const services = {
  twitter: {
    el: document.querySelector('input[name="twitter-instance"]'),
    customEl: document.querySelector('input[name="twitter-custom"]'),
    switch: document.getElementById("switch-twitter"),
    default: "nitter.net",
    originalDomain: "twitter.com",
    status: document.querySelector('.service-fieldset:nth-child(1) .service-status')
  },
  instagram: {
    el: document.querySelector('input[name="instagram-instance"]'),
    customEl: document.querySelector('input[name="instagram-custom"]'),
    switch: document.getElementById("switch-instagram"),
    default: "imginn.com",
    originalDomain: "instagram.com",
    status: document.querySelector('.service-fieldset:nth-child(2) .service-status')
  },
  youtube: {
    el: document.querySelector('input[name="youtube-instance"]'),
    customEl: document.querySelector('input[name="youtube-custom"]'),
    switch: document.getElementById("switch-youtube"),
    default: "yewtu.be",
    originalDomain: "youtube.com",
    status: document.querySelector('.service-fieldset:nth-child(3) .service-status')
  },
  reddit: {
    el: document.querySelector('input[name="reddit-instance"]'),
    customEl: document.querySelector('input[name="reddit-custom"]'),
    switch: document.getElementById("switch-reddit"),
    default: "old.reddit.com",
    originalDomain: "reddit.com",
    status: document.querySelector('.service-fieldset:nth-child(4) .service-status')
  },
  disable: {
    el: document.getElementById("disable")
  }
};

// Initialize the UI and event listeners
function init() {
  // Load saved settings from storage
  loadSettings();

  // Set up event listeners for "Use Default" buttons
  document.querySelectorAll('.use-default').forEach(button => {
    button.addEventListener('click', (e) => {
      const service = e.target.dataset.service;
      services[service].el.value = services[service].default;
    });
  });

  // Set up event listeners for switches to update status text
  Object.values(services).forEach(service => {
    if (service.switch) {
      service.switch.addEventListener('change', updateStatusText);
    }
  });

  // Set up event listeners for custom domain inputs to update target domain
  Object.keys(services).forEach(serviceName => {
    if (serviceName !== 'disable') {
      const service = services[serviceName];
      if (service.customEl) {
        service.customEl.addEventListener('input', (e) => {
          const customValue = e.target.value.trim();
          if (customValue) {
            service.el.value = customValue;

            // Add highlight animation
            service.el.classList.add('highlight-update');

            // Remove the class after animation completes
            setTimeout(() => {
              service.el.classList.remove('highlight-update');
            }, 1000);
          }
        });
      }
    }
  });

  // Set up form submission handler
  document.forms[0].addEventListener('submit', saveSettings);

  // Initial status text update
  updateAllStatusTexts();
}

// Load settings from browser storage
function loadSettings() {
  browser.storage.local.get().then((settings) => {
    // Apply saved settings for each service
    Object.keys(services).forEach(service => {
      // First set custom domain if available
      if (settings[`custom_${service}`]) {
        const customValue = settings[`custom_${service}`].trim();
        services[service].customEl.value = customValue;

        // If custom domain is set and not empty, use it as target domain
        if (customValue && service !== 'disable' && services[service].el) {
          services[service].el.value = customValue;
        } else if (settings[service]) {
          // Otherwise use the saved target domain
          services[service].el.value = settings[service];
        }
      } else if (settings[service]) {
        // If no custom domain, use the saved target domain
        services[service].el.value = settings[service];
      }

      // Set switch state
      if (settings[`disable_${service}`] !== undefined && services[service].switch) {
        services[service].switch.checked = !settings[`disable_${service}`];
      }
    });

    if (settings.disable !== undefined) {
      services.disable.el.checked = settings.disable;
    }

    updateAllStatusTexts();
  });
}

// Save settings to browser storage
function saveSettings(e) {
  e.preventDefault();

  const settings = {
    disable: services.disable.el.checked
  };

  // Gather settings for each service
  Object.keys(services).forEach(service => {
    if (service !== 'disable') {
      // Get custom domain value
      const customValue = services[service].customEl.value.trim();

      // Save custom domain
      settings[`custom_${service}`] = customValue;

      // If custom domain is set, use it as target domain
      if (customValue) {
        settings[service] = customValue;
      } else {
        // Otherwise use the value from target domain field
        settings[service] = services[service].el.value.trim();
      }

      settings[`disable_${service}`] = !services[service].switch.checked;
    }
  });

  // Update background script with new settings
  browser.runtime.sendMessage({
    type: "bg_update_instances",
    instancesSelected: settings
  });

  // Save to storage and close popup
  browser.storage.local.set(settings).then(() => {
    // Show a brief success message before closing
    const successMsg = document.createElement('div');
    successMsg.className = 'success-message';
    successMsg.textContent = 'Settings saved!';
    document.body.appendChild(successMsg);

    setTimeout(() => {
      window.close();
    }, 800);
  });
}

// Update the status text for all services
function updateAllStatusTexts() {
  Object.values(services).forEach(service => {
    if (service.switch) {
      updateStatusText({target: service.switch}, service);
    }
  });
}

// Update the status text for a single service
function updateStatusText(e, service = null) {
  if (!service) {
    // Find which service this switch belongs to
    const switchId = e.target.id.replace('switch-', '');
    service = services[switchId];
  }

  if (service && service.status) {
    const isActive = e.target.checked;
    // When PIN is on, use target domain; when PIN is off, use default domain
    service.status.textContent = `PIN: ${isActive ? 'On' : 'Off'} (Default: ${service.originalDomain})`;
  }
}

// Initialize the extension when DOM is loaded
document.addEventListener('DOMContentLoaded', init);