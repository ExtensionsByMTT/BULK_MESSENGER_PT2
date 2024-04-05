export function formatDate(dateString) {
  const date = new Date(dateString);
  // Format the date and time separately
  const formattedDate = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true, // Use 12-hour format
  });

  return { formattedDate, formattedTime };
}

export function trimMessage(message, maxLength = 20) {
  return message.length > maxLength
    ? message.substring(0, maxLength) + "..."
    : message;
}

export const sortData = (
  column: "created_at",
  data,
  filteredData,
  setFilteredData,
  createdAtSortOrder,
  setCreatedAtSortOrder
) => {
  const dataToSort = filteredData.length > 0 ? filteredData : data;

  const sortedData = [...dataToSort].sort((a, b) => {
    const dateA = new Date(a[column]).getTime(); // Parse and convert to numeric timestamp
    const dateB = new Date(b[column]).getTime(); // Parse and convert to numeric timestamp
    const sortOrder = createdAtSortOrder;

    return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
  });

  setFilteredData(sortedData);
  setCreatedAtSortOrder(createdAtSortOrder === "asc" ? "desc" : "asc");
};

export const statusChangeHandler = (e, data, setFilteredData) => {
  const selectedStatus = e.target.value;
  console.log("SATUS : ", selectedStatus);

  const filteredData =
    selectedStatus === "all"
      ? data
      : data.filter((item) => item.status === selectedStatus);

  setFilteredData(filteredData);
};
