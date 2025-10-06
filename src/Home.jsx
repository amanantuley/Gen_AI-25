import { useState, useEffect } from "react";
import Papa from "papaparse";

import "./home.css";
import Logo from "./assets/logo.svg";

function Home() {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalCompleted, setTotalCompleted] = useState(0);

  useEffect(() => {
    Papa.parse("./leaderboard.csv", {
      download: true,
      header: true,
      complete: (result) => {
        const data = result.data.map((row) => {
          const badgesCompleted = parseInt(row["# of Skill Badges Completed"], 10);
          const gamesCompleted = parseInt(row["# of Arcade Games Completed"], 10);
          const totalItems = 16;
          const percentage = ((badgesCompleted + gamesCompleted) / totalItems) * 100;

          return {
            ...row,
            badgesCompleted,
            gamesCompleted,
            percentage,
            rank: 0
          };
        });

        setTotalCompleted(0);
        data.sort((a, b) => b.percentage - a.percentage);
        data.forEach((row, index) => {
          row.rank = index + 1;

          if (row["All Skill Badges & Games Completed"] === "Yes") {
            setTotalCompleted((prev) => prev + 1);
          }
        });

        setLeaderboardData(data);

        if (data[data.length - 1]["User Name"] === "") {
          data.pop();
        }
      },
    });
  }, []);

  const filteredData = leaderboardData.filter((row) => {
    return (
      row["User Name"]?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row["User Email"]?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="overflow-hidden">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-2">
            <div className="md:flex md:items-center md:gap-12">
              <a className="block text-teal-600" href="#">
                <span className="sr-only">Home</span>
                <img src={Logo} className="lg:h-24 h-20" />
              </a>
            </div>
          </div>
        </div>
      </header>
      <div className="px-6 pb-8 pt-16 mx-auto text-center pattern">
        <div className="max-w-lg mx-auto pb-4">
          <h1 className="text-2xl text-gray-500 lg:text-4xl">Welcome to</h1>
          <div className="flex justify-center items-center whitespace-nowrap mt-1 lg:mt-2">
            <h2 className="lg:mr-4 mr-2 lg:text-7xl text-3xl font-bold text-red-500 inline-block">
              GenAI
            </h2>
            <h2 className="lg:mr-4 mr-2 lg:text-7xl text-3xl font-bold text-blue-600 inline-block">
              Study
            </h2>
            <h2 className="lg:mr-4 mr-2 lg:text-7xl text-3xl font-bold text-green-600 inline-block">
              Jams
            </h2>
            <h2 className="text-3xl lg:text-7xl font-bold text-yellow-500 inline-block">
              2024
            </h2>
          </div>
          <p className="mt-3 lg:mt-5 text-gray-500 text-xl">
            This is an institute level rankings leaderboard for <br />
            <b>Google GenAI Study Jams 2024</b> of <b>GDGC AIKTC</b> <br />
            <p className="text-gray-500 text-lg">
              Updated as of <span className="underline">21th November 2024</span>
            </p>
          </p>
          <p className="mt-3 lg:mt-5 text-gray-500 text-xl">
            Follow <a target="_blank" className="underline font-bold" href="https://studyjams.netlify.app/">this</a> link for tutorials on how to complete the labs
          </p>
        </div>
        <div className="container mx-auto">
          <div className="flex flex-wrap justify-center text-center">
            <a href="#" className="group relative w-full lg:w-1/5 mx-0 my-4 lg:m-4 ">
              <span className="p-5 absolute inset-0 border-2 border-dashed border-yellow-500 rounded-md"></span>
              <div className="p-5 relative flex transform items-center justify-center border-2 border-yellow-500 rounded-md bg-white transition-transform group-hover:-translate-x-2 group-hover:-translate-y-2">
                <div className=" !pt-0 transition-opacity group-hover:absolute group-hover:opacity-0 ">
                  <h2 className="title-font font-medium text-3xl text-yellow-500 ">
                    120
                  </h2>
                  <p className="leading-relaxed">Eligible Participants</p>
                </div>
                <div className="absolute opacity-0 transition-opacity group-hover:relative group-hover:opacity-100">
                  <h2 className="title-font font-medium text-3xl text-yellow-500 ">
                    120
                  </h2>
                  <p className="leading-relaxed">Eligible Participants</p>
                </div>
              </div>
            </a>
            <a href="#" className="group relative w-full lg:w-1/5 mx-0 my-4 lg:m-4 ">
              <span className="p-5 absolute inset-0 border-2 border-dashed border-red-600 rounded-md"></span>
              <div className="p-5 relative flex transform items-center justify-center border-2 border-red-600 rounded-md bg-white transition-transform group-hover:-translate-x-2 group-hover:-translate-y-2">
                <div className=" !pt-0 transition-opacity group-hover:absolute group-hover:opacity-0 ">
                  <h2 className="title-font font-medium text-3xl text-red-500">
                    183
                  </h2>
                  <p className="leading-relaxed">Participants Registered</p>
                </div>
                <div className="absolute opacity-0 transition-opacity group-hover:relative group-hover:opacity-100">
                  <h2 className="title-font font-medium text-3xl text-red-500">
                    183
                  </h2>
                  <p className="leading-relaxed">Participants Registered</p>
                </div>
              </div>
            </a>
            <a href="#" className="group relative w-full lg:w-1/5 mx-0 my-4 lg:m-4 ">
              <span className="p-5 absolute inset-0 border-2 border-dashed border-green-500 rounded-md"></span>
              <div className="p-5 relative flex transform items-center justify-center border-2 border-green-500 rounded-md bg-white transition-transform group-hover:-translate-x-2 group-hover:-translate-y-2">
                <div className="!pt-0 transition-opacity group-hover:absolute group-hover:opacity-0 ">
                  <h2 className="title-font font-medium text-3xl text-green-500">
                    {totalCompleted}
                  </h2>
                  <p className="leading-relaxed">Participants Qualified</p>
                </div>
                <div className="absolute opacity-0 transition-opacity group-hover:relative group-hover:opacity-100">
                  <h2 className="title-font font-medium text-3xl text-green-500">
                    {totalCompleted}
                  </h2>
                  <p className="leading-relaxed">Participants Qualified</p>
                </div>
              </div>
            </a>
          </div>
        </div>
        <div className="w-full lg:max-w-sm mx-auto mt-4 bg-white border rounded-md focus-within:border-blue-400 focus-within:ring focus-within:ring-blue-300 focus-within:ring-opacity-40">
          <form className="flex flex-row">
            <input
              type="text"
              placeholder="Enter your name or email..."
              className="w-full flex-1 text-lg h-10 px-4 py-2 m-1 text-gray-700 placeholder-gray-400 bg-transparent border-none appearance-none focus:outline-none focus:placeholder-transparent focus:ring-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="bg-blue-700 flex justify-center items-center rounded-md px-3 m-1">
              <svg
                className="h-5 w-5 text-white"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
              </svg>
            </div>
          </form>
        </div>
      </div>
      <section className="px-4 pl-10 my-2 lg:px-4 lg:my-0 lg:overflow-hidden overflow-x-auto pattern">
        <div className="flex flex-col mb-6">
          <div className="-mx-4 sm:-mx-6 lg:-mx-8 ">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8 mr-6 lg:mr-0">
              <div className="overflow-hidden border border-gray-200 rounded-md">
                <table className="table-fixed divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="w-1/8 px-4 py-3.5 font-semibold text-left rtl:text-right text-gray-500">
                        Rank
                      </th>
                      <th scope="col" className="w-1/8 py-3.5 px-4 font-semibold text-left rtl:text-right text-gray-500">
                        Name & Email
                      </th>
                      <th scope="col" className="w-1/8 px-4 py-3.5 font-semibold text-left rtl:text-right text-gray-500">
                        Access Code Redemption Status
                      </th>
                      <th scope="col" className="w-1/8 px-4 py-3.5 font-semibold text-left rtl:text-right text-gray-500">
                        Eligible for Rewards?
                      </th>
                      <th scope="col" className="w-1/8 px-4 py-3.5 font-semibold text-left rtl:text-right text-gray-500">
                        No. of Skill Badges Completed
                      </th>
                      <th scope="col" className="w-1/8 px-4 py-3.5 font-semibold text-left rtl:text-right text-gray-500">
                        All Arcade Game Completed?
                      </th>
                      <th scope="col" className="w-1/8 px-4 py-3.5 font-semibold text-left rtl:text-right text-gray-500">
                        Completion Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 w-full">
                    {filteredData.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center text-lg py-4 text-gray-500 w-screen">
                          Kindly check your name / email & try again
                        </td>
                      </tr>
                    ) : (
                      filteredData.map((row, index) => (
                        <tr key={index}>
                          <td className="px-4 py-4 text-md font-bold whitespace-nowrap">
                            <div>
                              <h4 className="text-gray-700 pl-2">{row["rank"]}</h4>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-md font-medium whitespace-nowrap">
                            <div>
                              <h2 className="font-medium text-gray-800">
                                {row["User Name"]}
                              </h2>
                              <p className="font-normal text-gray-600">
                                {row["User Email"]}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-md font-medium whitespace-nowrap">
                            {
                              row["Access Code Redemption Status"] === "Yes" ? (
                                <div className="inline px-3 py-1 font-normal rounded-full text-green-500 bg-green-100/60">
                                  {row["Access Code Redemption Status"]}
                                </div>
                              ) : (
                                <div className="inline px-3 py-1 font-normal rounded-full text-red-500 bg-red-100/60">
                                  {row["Access Code Redemption Status"]}
                                </div>
                              )
                            }
                          </td>
                          <td className="px-4 py-4 text-md whitespace-nowrap">
                            {
                              row["All Skill Badges & Games Completed"] === "Yes" ? (
                                <div className="inline px-3 py-1 font-normal rounded-full text-green-500 bg-green-100/60">
                                  {row["All Skill Badges & Games Completed"]}
                                </div>
                              ) : (
                                <div className="inline px-3 py-1 font-normal rounded-full text-red-500 bg-red-100/60">
                                  {row["All Skill Badges & Games Completed"]}
                                </div>
                              )
                            }
                          </td>
                          <td className="px-4 py-4 text-md whitespace-nowrap">
                            <div>
                              <h4 className="text-gray-700">
                                {row["# of Skill Badges Completed"]}
                              </h4>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div>
                              <h4 className="text-gray-700">
                                {
                                  row["# of Arcade Games Completed"] === "0" ? (
                                    <div className="inline px-3 py-1 font-normal rounded-full text-red-500 bg-red-100/60">
                                      No
                                    </div>
                                  ) : (
                                    <div className="inline px-3 py-1 font-normal rounded-full text-green-500 bg-green-100/60">
                                      Yes
                                    </div>
                                  )
                                }
                              </h4>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-md whitespace-nowrap">
                            <div className="w-full h-1.5 bg-blue-200 overflow-hidden rounded-full">
                              <div
                                className="bg-blue-500 h-1.5"
                                style={{ width: `${row["percentage"]}%` }}
                              ></div>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
