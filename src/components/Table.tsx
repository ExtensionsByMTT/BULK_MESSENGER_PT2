import React, { useEffect, useState } from "react";
import { formatDate, sortData, trimMessage } from "../utils/utlis";
import Modal from "./Modal";
import { config } from "../utils/config";

const Table = ({
  type,
  fieldsHeading,
  fieldsData,
  data,
  filteredData,
  setFilteredData,
  searchInput,
  selectedDate,
  setRefresh,
}) => {
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [createdAtSortOrder, setCreatedAtSortOrder] = useState("asc");
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [selectAllTasks, setSelectAllTasks] = useState(false);
  const [reasonToDelete, setReasonToDelete] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [view, setView] = useState();
  
  const statusChangeHandler = (e) => {
    setSelectedStatus(e.target.value);
  };

  const applyAllFilters = (data) => {
    let filteredData = Array.isArray(data) ? data : [];

    // Apply search filter
    if (searchInput) {
      filteredData = filteredData.filter((item) =>
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(searchInput.toLowerCase())
        )
      );
    }

    // Apply status filter
    if (selectedStatus !== "all") {
      filteredData = filteredData.filter(
        (item) => item.status === selectedStatus
      );
    }

    // Apply date filter
    if (selectedDate) {
      filteredData = filteredData.filter(
        (item) =>
          new Date(item.created_at).toDateString() ===
          new Date(selectedDate).toDateString()
      );
    }

    return filteredData;
  };

  useEffect(() => {
    const newData = applyAllFilters(data);
    setFilteredData(newData);
  }, [data, searchInput, selectedStatus, selectedDate]);

  const handleSelectTasks = (id) => {
    setSelectedTasks((prevSelected) => {
      const isSelected = prevSelected.includes(id);
      if (isSelected) {
        return prevSelected.filter((messageId) => messageId != id);
      } else {
        return [...prevSelected, id];
      }
    });
  };

  const handleSelectAllTasks = () => {
    if (selectAllTasks) {
      setSelectedTasks([]);
      setSelectAllTasks(false);
    } else {
      setSelectedTasks(filteredData.map((message) => message));
      setSelectAllTasks(true);
    }
  };

  const handleDeleteTasks = async () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleConfirmDeleteTasks = async () => {
    if (reasonToDelete.trim() == "") {
      alert("Please specify the reason to delete these messages");
      return;
    }

    const deleteTasks = async (taskIds, type) => {
      try {
        const response = await fetch(`${config.SERVER_URL}/api/tasks`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ taskIds, type, reason: reasonToDelete }),
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to delete tasks");
        }

        alert(data.message);
        return data;
      } catch (error) {
        alert(`Error: ${error.message}`);
        throw error;
      }
    };

    try {
      const scheduledTasks = selectedTasks
        .filter((task) => task.status === "scheduled")
        .map((task) => task._id);

      const nonScheduledTasks = selectedTasks
        .filter((task) => task.status !== "scheduled")
        .map((task) => task._id);

      if (scheduledTasks.length > 0) {
        await deleteTasks(scheduledTasks, "scheduled");
      }

      if (nonScheduledTasks.length > 0) {
        await deleteTasks(nonScheduledTasks, "normal");
      }

      setRefresh(true);
      handleCancel();
    } catch (error) {
      console.error("Error deleting tasks:", error);
      alert(error.message);
    }
  };

  const handleCancel = () => {
    handleCloseModal();
    setSelectedTasks([]);
  };

  const handleViewTask = (task) => {
    console.log(task, ":data");
    setView(task);
  };
  return (
    <div className="table">
      <table>
        <thead>
          <tr className="heading-row">
            {fieldsHeading.map((heading, index) => {
              switch (heading) {
                case "Status":
                  return (
                    <th className="Status">
                      <select
                        defaultValue="Status"
                        onChange={statusChangeHandler}
                        className=" bg-transparent text-center"
                      >
                        <option hidden value="Status">
                          {heading}
                        </option>
                        <option value="all">All</option>
                        <>
                          <option value="success">Success</option>
                          <option value="failed">Failed</option>
                          <option value="pending">Pending</option>
                          <option value="scheduled">Scheduled</option>
                        </>
                      </select>{" "}
                    </th>
                  );

                case "Created At":
                  return (
                    <th
                      onClick={() =>
                        sortData(
                          "createdAt",
                          data,
                          filteredData,
                          setFilteredData,
                          createdAtSortOrder,
                          setCreatedAtSortOrder
                        )
                      }
                      style={{ textAlign: "center" }}
                    >
                      {heading}
                    </th>
                  );

                case "Scheduled At":
                  return (
                    <th
                      onClick={() =>
                        sortData(
                          "scheduledAt",
                          data,
                          filteredData,
                          setFilteredData,
                          createdAtSortOrder,
                          setCreatedAtSortOrder
                        )
                      }
                      style={{ textAlign: "center" }}
                    >
                      {heading}
                    </th>
                  );

                case "Deleted At":
                  return (
                    <th
                      className="Created"
                      onClick={() =>
                        sortData(
                          "createdAt",
                          data,
                          filteredData,
                          setFilteredData,
                          createdAtSortOrder,
                          setCreatedAtSortOrder
                        )
                      }
                      style={{ textAlign: "center" }}
                    >
                      {heading}
                    </th>
                  );

                case "Delete":
                  return (
                    <th>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-end",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedTasks.length > 0}
                          onChange={handleSelectAllTasks}
                        />
                      </div>
                    </th>
                  );
                default:
                  return <th>{heading}</th>;
              }
            })}
          </tr>
        </thead>
        <tbody>
          {filteredData.map((data, idx) => {
            const { formattedDate: deleteDate, formattedTime: deleteTime } =
              formatDate(data.createdAt);

            const {
              formattedDate: scheduledDate,
              formattedTime: scheduledTime,
            } = formatDate(data.scheduledAt);
            return (
              <tr key={data._id} className="data-row">
                {fieldsData.map((field) => {
                  switch (field) {
                    case "createdAt":
                      return (
                        <td className="time">
                          <p>{deleteTime}</p>
                          <p>{deleteDate}</p>
                        </td>
                      );

                    case "scheduledAt":
                      return (
                        <td className="time">
                          <p>{scheduledTime}</p>
                          <p>{scheduledDate}</p>
                        </td>
                      );

                    case "message":
                      return (
                        <td className="message">{trimMessage(data[field])}</td>
                      );

                    case "reason":
                      return (
                        <td className="message">{trimMessage(data[field])}</td>
                      );

                    case "status":
                      return (
                        <td className="status">
                          <p className={`${data[field]}`}>{data[field]}</p>
                        </td>
                      );
                    case "View":
                      return (
                        <td className="View">
                          <button onClick={() => handleViewTask(data)}>
                            View
                          </button>
                        </td>
                      );

                    case "delete":
                      return (
                        <td>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "flex-end",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={selectedTasks.includes(data)}
                              onChange={() => handleSelectTasks(data)}
                            />
                          </div>
                        </td>
                      );
                    default:
                      return <td>{data[field]}</td>;
                  }
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      {selectedTasks.length > 0 && (
        <button className="delete" onClick={handleDeleteTasks}>
          Delete
        </button>
      )}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <div className="reason-container">
          <h3>Specify Reason to Delete</h3>
          <br />
          <textarea
            id="reason"
            name="reason"
            rows={4}
            cols={50}
            value={reasonToDelete}
            onChange={(e) => setReasonToDelete(e.target.value)}
          />
          <br />
          <button onClick={handleConfirmDeleteTasks} className="delete">
            Submit
          </button>
          <button onClick={handleCancel} className="cancel">
            Cancel
          </button>
        </div>
      </Modal>
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <div>
          <p>{view?.agent}</p>
          <p>{view?.message}</p>
          <p>{view?.reason}</p>
          <p>{view?.sent_to}</p>
          <p>{view?.status}</p>
        </div>
      </Modal>
    </div>
  );
};

export default Table;
