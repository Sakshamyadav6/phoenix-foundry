// Everything the club needs to fill in lives here.
// Values left as null (or in [BRACKETS]) render as visible dashed placeholders on the site.

export const site = {
  // [UPLOAD/INSERT LOGO]: put the file in /public (e.g. public/logo.svg) and set logo: 'logo.svg'
  logo: "logo.png",
  logoOnDark: "logo-white.png", // white version used in the dark green footer

  links: {
    phoenixConnect: "https://uwgb.presence.io/organization/phoenix-foundry", // [LINK] Phoenix Connect page URL
    cohortApplication: null, // [LINK] Cohort application form URL
    instagram: null, // e.g. 'https://instagram.com/yourhandle'
  },
  instagramHandle: "@phoenixfoundry", // [@HANDLE] e.g. '@phoenixfoundry'
  email: "sofounder@uwgb.edu", // [EMAIL]

  nextEvent: {
    name: null, // [EVENT NAME]
    date: null, // [DATE]
    location: null, // [LOCATION]
  },
};

// Photos: put files in /public/team and set photo: 'team/firstname.jpg'
export const team = [
  {
    name: "Saksham Yadav",
    title: "Studio Director",
    photo: "team/saksham.jpg",
  },
  {
    name: "Sumit Karki",
    title: "Associate Studio Director",
    photo:
      "https://www.uwgb.edu/getmedia/03386d56-8cbf-4d34-9e33-77cb1a802eba/Sumit-Karki",
  },
  {
    name: "Alex Ritt",
    title: "Director of Projects and Partnerships",
    photo: null,
  },
  {
    name: "Dinesh Bajgai",
    title: "Director of Finance and Resources",
    photo: null,
  },
  {
    name: "Pitambar Pandey",
    title: "Director of Communication and Outreach",
    photo: "https://www.iampitambar.com/profile.jpg",
  },
];

export const advisor = {
  firstName: "Adam",
  lastName: "Novotny", // [LAST NAME]
  title: "Assistant Director of Student Engagement Center, UW-Green Bay",
};
