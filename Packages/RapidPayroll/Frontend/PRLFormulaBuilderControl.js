(function () {
  const tokenPanel = document.getElementById("tokenPanel");
  const formulaText = document.getElementById("formulaText");
  const status = document.getElementById("status");

  const tokens = [
    "BASICSALARY", "HOURLYRATE", "OTHOURS15", "OTHOURS20", "LEAVEHOURS", "SCHEDULEDHOURS",
    "ISEXEMPT", "+", "-", "*", "/", "(", ")", ","
  ];

  function pushToken(token) {
    formulaText.value += formulaText.value && /[A-Z0-9_]$/.test(formulaText.value) ? ` ${token}` : token;
    formulaText.focus();
  }

  function renderTokens() {
    tokens.forEach((token) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = token;
      btn.addEventListener("click", () => pushToken(token));
      tokenPanel.appendChild(btn);
    });
  }

  async function callService(methodName, payload) {
    const response = await fetch(`/api/services/PRLFormulaBuilderService/${methodName}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload || {})
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `Service call failed: ${response.status}`);
    }
    return response.json();
  }

  function setStatus(text, isError) {
    status.className = isError ? "err" : "ok";
    status.textContent = text;
  }

  document.getElementById("validateBtn").addEventListener("click", async () => {
    try {
      const expression = formulaText.value.trim();
      const result = await callService("validateFormula", { _expression: expression });
      setStatus(result ? "Formula is valid." : "Formula is invalid.", !result);
    } catch (error) {
      setStatus(error.message, true);
    }
  });

  document.getElementById("previewBtn").addEventListener("click", async () => {
    try {
      const expression = formulaText.value.trim();
      const sampleEmployee = {
        employeeId: "Preview",
        legalEntity: document.getElementById("legalEntity").value || "",
        countryRegionId: document.getElementById("countryCode").value || "",
        payrollCurrency: "USD",
        isExempt: false,
        basicSalary: 10000,
        scheduledHours: 160,
        overtimeHours15: 8,
        overtimeHours20: 3,
        leaveHours: 4,
        serviceYears: 5
      };
      const value = await callService("previewFormula", {
        _expression: expression,
        _employee: sampleEmployee,
        _payoutCurrency: "USD"
      });
      setStatus(`Preview value: ${value}`, false);
    } catch (error) {
      setStatus(error.message, true);
    }
  });

  document.getElementById("saveBtn").addEventListener("click", async () => {
    try {
      const payload = {
        _formula: {
          formulaId: "",
          componentCode: document.getElementById("componentCode").value.trim(),
          expression: formulaText.value.trim(),
          countryRegionId: document.getElementById("countryCode").value.trim(),
          legalEntity: document.getElementById("legalEntity").value.trim(),
          isExemptOnly: false
        }
      };
      await callService("saveFormula", payload);
      setStatus("Formula saved.", false);
    } catch (error) {
      setStatus(error.message, true);
    }
  });

  renderTokens();
})();
