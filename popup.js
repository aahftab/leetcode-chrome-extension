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
    const API_URL = 'https://esuejqaspbhebyjoycoi.supabase.co/functions/v1/validate-and-update';
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

              fetch(API_URL, {
                method: "POST",
                headers: {
                  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0",
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  userData: data.data.userStatus,
                  problemUrl: tab.url,
                }),
              })
                .then((res) => {
                  if (res.status === 400) {
                    alert("This problem is already solved by you.");
                  }

                  return res.json()})
                .then((data) => {
                  if(data.message === "error"){
                    alert("Some error occured. Please try again later.");
                  }
                  log(tabId, "invoked");
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
