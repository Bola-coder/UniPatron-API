const Interview = require("../models/interview.model");
const Application = require("../models/application.model");
const { Op } = require("sequelize");
const sendEmail = require("./../utils/email");
// const sendInverviewReminder = async () => {
//   // Get the current date and time
//   const now = new Date();
//   console.log("Current date and time is: ", now);
//   console.log(now.toUTCString());

//   // Calculate the date and time 24 hours from now
//   const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
//   console.log("Tomorrow date and time is: ", twentyFourHoursFromNow);

//   // Fetch interviews scheduled within the next 24 hours
//   const interviews = await Interview.findAll({
//     where: {
//       date: {
//         [Op.between]: [
//           now.toISOString().split("T")[0],
//           twentyFourHoursFromNow.toISOString().split("T")[0],
//         ],
//       },
//       time: {
//         [Op.between]: [
//           now.toTimeString().split(" ")[0],
//           twentyFourHoursFromNow.toTimeString().split(" ")[0],
//         ],
//       },
//     },
//     include: {
//       model: Interview.Application,
//       include: [Interview.Application.User, Interview.Application.Job],
//     },
//   });

//   console.log(
//     "Interviews scheduled within the next 24 hours are: ",
//     interviews
//   );

//   if (interviews.length === 0) {
//     console.log("No interviews scheduled for today, so no email sent outs");
//     return;
//   }

//   interviews.forEach(async (interview) => {
//     const message = `This is a reminder email to inform you have an interview scheduled for the job ${interview.Application.Job.name} on ${interview.date} at ${interview.time}. The interview will be held on ${interview.link}`;
//     const name = interview.Application.User.getFullName();
//     const template = "interview-scheduled";
//     const context = { message, name };

//     await sendEmail({
//       email: interview.Application.User.email,
//       subject: "Interview Reminder",
//       template,
//       context,
//     });
//   });
// };

const padZero = (num) => (num < 10 ? `0${num}` : num); // Function to pad single-digit numbers with leading zero

const formatTime = (timeString) => {
  const [hour, minute, second] = timeString.split(":").map(Number); // Split time string into components and convert them to numbers
  return `${padZero(hour)}:${padZero(minute)}:${padZero(second)}`; // Format the time string with leading zeros
};

const sendInverviewReminder = async () => {
  // Get the current date and time
  const now = new Date();
  // console.log("Current date and time is: ", now);
  // console.log(now.toUTCString());

  // Calculate the date and time 24 hours from now
  const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const twelveHoursFromNow = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  console.log(formatTime(now.toTimeString().split(" ")[0]));
  console.log(formatTime(twelveHoursFromNow.toTimeString().split(" ")[0]));

  // console.log("Tomorrow date and time is: ", twentyFourHoursFromNow);

  console.log("Heyy");
  // Fetch interviews scheduled within the next 24 hours
  try {
    const interviews = await Interview.findAll({
      where: {
        date: {
          [Op.between]: [
            now.toISOString().split("T")[0],
            twentyFourHoursFromNow.toISOString().split("T")[0],
          ],
        },
        time: {
          [Op.between]: [
            formatTime(now.toTimeString().split(" ")[0]),
            formatTime(twelveHoursFromNow.toTimeString().split(" ")[0]),
          ],
        },
      },
      include: {
        model: Application,
        include: ["User", "Job"],
      },
    });

    console.log("Heyy2222");

    console.log(
      "Interviews scheduled within the next 24 hours are: ",
      interviews
    );

    if (interviews.length === 0) {
      console.log("No interviews scheduled for today, so no email sent outs");
      return;
    }

    interviews.forEach(async (interview) => {
      const message = `This is a reminder email to inform you have an interview scheduled for the job ${interview.Application.Job.name} on ${interview.date} at ${interview.time}. The interview will be held on ${interview.link}`;
      const name = interview.Application.User.getFullName();
      const template = "interview-scheduled";
      const context = { message, name };

      await sendEmail({
        email: interview.Application.User.email,
        subject: "Interview Reminder",
        template,
        context,
      });
    });
  } catch (error) {
    console.log("Error fetching interviews: ", error);
  }
};

// module.exports = sendInverviewReminder;

module.exports = sendInverviewReminder;
