"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [questions, setQuestions] = useState(null);
  const [responses, setResponses] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [finalResponse, setFinalResponse] = useState([]);

  useEffect(() => {
    fetch("/api/questions")
      .then((response) => response.json())
      .then((data) => {
        setQuestions(data);
        initializeResponses(data);
      })
      .catch((error) => console.error("Error fetching questions:", error));
  }, []);

  const initializeResponses = (data) => {
    const initialResponses = {};
    data.sections.forEach((section) => {
      section.questions.forEach((question) => {
        if (question.type === "input") {
          question.fields.forEach((field) => {
            initialResponses[field.columnName] = null;
          });
        } else if (question.type === "radio" || question.type === "checkbox") {
          initialResponses[question.columnName] = question.multiselect
            ? []
            : null;
        }
      });
    });
    setResponses(initialResponses);
  };

  const handleOptionChange = (e, columnName, multiselect) => {
    const { value } = e.target;
    if (multiselect) {
      setResponses((prevResponses) => {
        const newValues = prevResponses[columnName] || [];
        if (newValues.includes(value)) {
          return {
            ...prevResponses,
            [columnName]: newValues.filter((val) => val !== value),
          };
        } else {
          return {
            ...prevResponses,
            [columnName]: [...newValues, value],
          };
        }
      });
    } else {
      setResponses({
        ...responses,
        [columnName]: value !== "Other" ? value : `Other - `,
      });
    }
  };

  const handleOtherChange = (e, columnName, multiselect) => {
    const { value } = e.target;
    if (multiselect) {
      setResponses((prevResponses) => {
        const otherIndex = prevResponses[columnName].findIndex((val) =>
          val.startsWith("Other - ")
        );
        const newValues = [...prevResponses[columnName]];
        if (otherIndex > -1) {
          newValues[otherIndex] = `Other - ${value.trimStart()}`;
        } else {
          newValues.push(`Other - ${value.trimStart()}`);
        }
        return {
          ...prevResponses,
          [columnName]: newValues,
        };
      });
    } else {
      setResponses({
        ...responses,
        [columnName]: `Other - ${value.trimStart()}`,
      });
    }
  };

  const handleInputChange = (e, columnName) => {
    const { value } = e.target;
    setResponses({
      ...responses,
      [columnName]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(responses);
    const d = responses["primaryErgonomicIssues"];
    responses["primaryErgonomicIssues"] = JSON.stringify(d);
    // fetch("/api/excel", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify(responses),
    // })
    //   .then((response) => {
    //     if (response.ok) {
    //       setSubmitted(true);
    //     } else {
    //       console.error("Error submitting form");
    //     }
    //   })
    //   .catch((error) => console.error("Error submitting form:", error));

    setSubmitted(true);
    const requestBody = {
      key: responses["monitoringLevel"],
    };

    fetch("/api/response", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })
      .then((response) => response.json())
      .then((data) => {
        setFinalResponse(data);
      })
      .catch((error) => console.error("Error fetching data:", error));
  };

  if (submitted) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-900 text-gray-200">
        <h1 className="font-extrabold text-4xl text-green-600 text-center mb-8">
          Form Submitted
        </h1>
        <p className="text-xl">Thank you for your submission!</p>
        <hr className="my-8 border-t border-gray-700" />
        <p className="font-bold text-blue-400 text-xl text-center mb-8">Based on your response:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {finalResponse.map((e) => (
            <div key={e.Ref} className="bg-gray-800 rounded-lg p-6 flex flex-col justify-between">
              <h2 className="font-extrabold text-2xl mb-4">{e.Title}</h2>
              <a className="text-blue-400" target="_blank" href={e.Ref}>Click here</a>
            </div>
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-start justify-start p-6">
      <div className="relative flex flex-col items-center w-full mb-8">
        <h1 className="font-extrabold text-6xl text-center mb-8">
          DigitalTwin Research Survey
        </h1>
      </div>

      {questions != null ? (
        <form
          onSubmit={handleSubmit}
          className="w-full flex flex-col items-center"
        >
          {questions.map((section, sectionIndex) => (
            <div key={sectionIndex} className="w-full mb-12">
              <h2 className="font-bold text-3xl mb-6">{section.header}</h2>
              {section.questions.map((question, questionIndex) => (
                <div
                  key={questionIndex}
                  className="w-10/12 p-6 ml-10 mb-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700"
                >
                  <p className="text-xl mb-4">
                    {question.question}
                    <span className="text-red-600 ml-2">*</span>
                  </p>
                  {question.type === "input" ? (
                    <div>
                      {question.fieldCount > 1 ? (
                        <div>
                          {question.fields.map((field, fieldIndex) => (
                            <div key={fieldIndex} className="mb-4 ml-6">
                              <label className="block text-lg mb-2">
                                {field.fieldName}{" "}
                                <span className="text-red-600">*</span>
                              </label>
                              <input
                                type="text"
                                required
                                className="block bg-slate-200 text-xl focus:outline-none active:outline-none text-blue-800 font-semibold w-1/2 p-2 border border-gray-300 rounded-md"
                                onChange={(e) =>
                                  handleInputChange(e, field.columnName)
                                }
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div>
                          <input
                            type="text"
                            required
                            className="block bg-slate-200 text-xl focus:outline-none active:outline-none text-blue-800 font-semibold w-full p-2 border border-gray-300 rounded-md"
                            onChange={(e) =>
                              handleInputChange(
                                e,
                                question.fields[0].columnName
                              )
                            }
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      {question.options.map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className="mb-2 flex items-center"
                        >
                          <input
                            id={`${option.replace(
                              / /g,
                              "_"
                            )}-${sectionIndex}-${questionIndex}-${optionIndex}`}
                            name={`${option.replace(
                              / /g,
                              "_"
                            )}-${sectionIndex}-${questionIndex}`}
                            type={question.multiselect ? "checkbox" : "radio"}
                            value={option}
                            className="mr-2 bg-slate-200 text-xl focus:outline-none active:outline-none text-blue-800 font-semibold"
                            checked={
                              question.multiselect
                                ? responses[question.columnName]?.includes(
                                    option
                                  )
                                : responses[question.columnName]?.startsWith(
                                    "Other -"
                                  )
                                ? option === "Other"
                                : responses[question.columnName] === option
                            }
                            onChange={(e) =>
                              handleOptionChange(
                                e,
                                question.columnName,
                                question.multiselect
                              )
                            }
                          />
                          <label
                            htmlFor={`${option.replace(
                              / /g,
                              "_"
                            )}-${sectionIndex}-${questionIndex}-${optionIndex}`}
                            className="text-lg mr-2"
                          >
                            {option}
                          </label>
                          {!question.multiselect &&
                            option.toLowerCase() === "other" &&
                            responses[question.columnName]?.startsWith(
                              "Other - "
                            ) && (
                              <input
                                type="text"
                                required
                                className="block text-xl bg-slate-200 focus:outline-none w-1/2 active:outline-none text-blue-800 font-semibold p-2 border border-gray-300 rounded-md"
                                value={
                                  responses[question.columnName]?.substring(
                                    7
                                  ) || ""
                                }
                                onChange={(e) =>
                                  handleOtherChange(
                                    e,
                                    question.columnName,
                                    question.multiselect
                                  )
                                }
                              />
                            )}
                          {question.multiselect &&
                          option.toLowerCase() === "other" &&
                          responses[question.columnName]?.find((val) =>
                            val.startsWith("Other")
                          ) ? (
                            <input
                              type="text"
                              required
                              className="block text-xl bg-slate-200 focus:outline-none w-1/2 active:outline-none text-blue-800 font-semibold p-2 border border-gray-300 rounded-md"
                              value={
                                responses[question.columnName]
                                  ?.find((val) => val.startsWith("Other - "))
                                  ?.substring(7) || ""
                              }
                              onChange={(e) =>
                                handleOtherChange(
                                  e,
                                  question.columnName,
                                  question.multiselect
                                )
                              }
                            />
                          ) : (
                            <></>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
          <div className="flex justify-center mt-4">
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              Submit
            </button>
          </div>
        </form>
      ) : (
        <p className="w-full flex items-center justify-center text-xl">
          Loading...
        </p>
      )}
    </main>
  );
}
