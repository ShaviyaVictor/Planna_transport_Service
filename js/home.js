const routes = [
  {
    id: 1,
    name: "CBD - Juja",
    from: "CBD",
    to: "Juja",
  },
  {
    id: 2,
    name: "CBD - Kikuyu",
    from: "CBD",
    to: "Kikuyu",
  },
  {
    id: 1,
    name: "CBD - Ngong",
    from: "CBD",
    to: "Ngong",
  },
];

const buses = [
  {
    id: 1,
    reg_no: "KCA 231K",
    seats: 45,
  },
  {
    id: 2,
    reg_no: "KCC 231K",
    seats: 45,
  },
  {
    id: 3,
    reg_no: "KCD 231K",
    seats: 45,
  },
];

const trips = [
  new Trip(1, 1, 2, 200, "16:00"),
  new Trip(2, 2, 1, 100, "15:00"),
  new Trip(3, 3, 2, 300, "14:00"),
];

// when page is loaded
$(function () {
  $("input.date").prop("min", function () {
    return new Date().toJSON().split("T")[0];
  });

  const from = getUrlParameter("from");
  const to = getUrlParameter("to");
  const date = getUrlParameter("date");

  if (from || to) {
    $("input.from").val(from);
    $("input.to").val(to);
    $("input.date").val(date);
  }

  const todayTrips = trips.filter((trip) => {
    const route = routes.find((r) => r.id == trip.route_id);
    if (from && to && date) {
      return (
        route.from.toLowerCase() == from.toLowerCase() &&
        route.to.toLowerCase() == to.toLowerCase()
      );
    } else {
      return isSameDay(trip.travel_date, new Date());
    }
  });

  if (todayTrips.length > 0) {
    $(".empty-results").addClass("d-none");
  }

  todayTrips.forEach((trip) => {
    const route = trip.getRoute();
    const bus = trip.getBus();

    $(".result-cards").append(`<div class="result-card card shadow px-4 py-4" data-trip="${trip.id}">
        <div class="row">
            <div class="col-md-2 text-md-left text-center">
                <img src="./images/bus.png" alt="" class="img-fluid">
            </div>
            <div class="col-md-10">
                <h6 class="bus-reg text-md-start text-center mt-md-0 mt-4">
                    ${bus.reg_no}
                </h6>
                <div class="row align-items-center mt-md-0 mt-4 trip-details">
                    <div class="col-md-3">
                        <p><b>Route</b></p>
                        <p>${route.name}</p>
                    </div>
                    <div class="col-md-2">
                        <p><b>Pickup Time</b></p>
                        <p>${trip.pickup_time}</p>
                    </div>
                    <div class="col-md-3">
                        <p><b>Availability</b></p>
                        <p>${trip.getAvailableSeats()} Seats</p>
                    </div>
                    <div class="col-md-2">
                        <p><b>Fare</b></p>
                        <p>${trip.currency}. ${trip.fare}</p>
                    </div>
                    <div class="col-md-2  text-center text-md-start mt-md-0 mt-3">
                        <button class="btn btn-bookseats">
                            Book Seats
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>`);
  });
});

function Trip(
  id,
  bus_id,
  route_id,
  fare,
  pickup_time,
  travel_date = new Date(),
  currency = "Ksh"
) {
  this.id = id;
  (this.bus_id = bus_id), (this.route_id = route_id);
  this.fare = fare;
  this.pickup_time = pickup_time;
  this.travel_date = travel_date;
  this.currency = currency;
  this.booked_seats = 0;
}

Trip.prototype.getBus = function () {
  return buses.find((b) => b.id == this.bus_id);
};

Trip.prototype.getRoute = function () {
  return routes.find((r) => r.id == this.route_id);
};

Trip.prototype.getAvailableSeats = function(){
    const bus = this.getBus();
    return bus.seats - this.booked_seats;
}

// get url parameters
function getUrlParameter(sParam) {
  var sPageURL = window.location.search.substring(1),
    sURLVariables = sPageURL.split("&"),
    sParameterName,
    i;

  for (i = 0; i < sURLVariables.length; i++) {
    sParameterName = sURLVariables[i].split("=");

    if (sParameterName[0] === sParam) {
      return typeof sParameterName[1] === undefined
        ? true
        : decodeURIComponent(sParameterName[1]);
    }
  }
  return false;
}

// check if same day
function isSameDay(date1, date2) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth()
  );
}
