document.getElementById("solved").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0].id;
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      function: (tabId) => {
        document.body.style.backgroundColor = "lightblue";
        console.log("Tab ID:", tabId);
      },
      args: [tabId],
    });

    chrome.tabs.get(tabId, (tab) => {
      if (tab.url.includes("https://leetcode.com/problems/")) {
        fetch("https://leetcode.com/graphql/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `{
          userStatus {
            userId
            isSignedIn
            isMockUser
            isPremium
            isVerified
            username
            avatar
            isAdmin
            isSuperuser
            permissions
            isTranslator
            activeSessionId
            checkedInToday
            notificationStatus {
              lastModified
              numUnread
            }
          }
        }`,
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            log(tabId, data.data.userStatus);

            if (data.data.userStatus.isSignedIn === true) {

              fetch("API_ENDPOINT", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  userData: data.data.userStatus,
                  problemUrl: tab.url,
                }),
              })
                .then((res) => res.json())
                .then((data) => {
                  log(tabId, data);
                })
                .catch(console.error);
            } else {
              alert("Please sign in to LeetCode");
            }
          })
          .catch(console.error);
      } else {
        alert("This is not a LeetCode problem page.");
      }
    });
  });
});

function log(tabId, userData) {
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    function: (userData) => {
      console.log("userData", userData);
    },
    args: [userData],
  });
}
