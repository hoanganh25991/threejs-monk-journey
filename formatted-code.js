const buffHtml = `
  <div class="skill-buff ${isActive ? "active" : ""}" data-buff="${buffName}">
    <div class="buff-header">
      <div class="buff-icon ${iconData.cssClass}" 
           style="background-color: rgba(0, 0, 0, 0.7); 
                  border: 2px solid ${iconData.color}; 
                  box-shadow: 0 0 10px ${iconData.color}40;">
        ${iconData.emoji}
      </div>
      <div class="buff-name">${buffName}</div>
      <div class="buff-cost">${cost} points</div>
    </div>
    <div class="buff-description">
      ${buffData.description || "No description available."}
    </div>
    <div class="buff-effects">
      ${buffData.effects
        ? buffData.effects
            .map((effect) => `<span class="effect-tag">${effect}</span>`)
            .join("")
        : ""
      }
    </div>
    <button class="buff-select-btn" 
            data-buff="${buffName}" 
            ${isActive ? "disabled" : ""}>
      ${isActive ? "Selected" : "Select Buff"}
    </button>
  </div>
`;