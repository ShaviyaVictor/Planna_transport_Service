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
    id: 3,
    name: "CBD - Ngong",
    from: "CBD",
    to: "Ngong",
  },
];

const matatuMap = ["ee_", "eee", "eee", "eee", "eee"];

const buses = [
  new Bus(1, "KCA 231K"),
  new Bus(2, "KCC 231K"),
  new Bus(3, "KCD 231K"),
  new Bus(4, "KDA 123J", 14, matatuMap),
];

const trips = [
  new Trip(1, 1, 2, 200, "16:00"),
  new Trip(2, 2, 1, 100, "15:00", undefined, [5]),
  new Trip(3, 3, 2, 300, "14:00", undefined, [1, 2]),
  new Trip(4, 4, 1, 150, "14:00", undefined, [5]),
];

// when page is loaded
$(function () {
  $("input.date")
    .prop("min", function () {
      return new Date().toJSON().split("T")[0];
    })
    .val(new Date().toJSON().split("T")[0]);

  const from = getUrlParameter("from");
  const to = getUrlParameter("to");
  const date = getUrlParameter("date");

  if (from || to) {
    $("input.from").val(from);
    $("input.to").val(to);
    $("input.date").val(date);
    $("span.result-date").text(new Date(date).toDateString());
  }

  const todayTrips = trips.filter((trip) => {
    const route = routes.find((r) => r.id == trip.route_id);
    if (from && to && date) {
      return (
        route.from.toLowerCase() == from.toLowerCase() &&
        route.to.toLowerCase() == to.toLowerCase() &&
        isSameDay(trip.travel_date, new Date(date))
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

    $(".result-cards")
      .append(`<div class="result-card card shadow px-md-4 px-3 py-4" data-trip="${
      trip.id
    }">
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
                        <p class="available-seats-${
                          trip.id
                        }">${trip.getAvailableSeats()} Seats</p>
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
        <div class="row seats d-none">
                <div class="col-md-7 d-flex justify-content-center px-md-3 px-0">
                    <div class="seats-chart">
                    <div class="front-indicator">
                        <img src="images/steering-wheel.png" class="img-thumbnail bg-transparent" alt="Driver" height="">
                    </div>
                    </div>
                </div>
                <div class="col-md-5 relative mt-4 mt-md-0">
                    <div class="booking-details">
                        <h2>Booking Details
                            <span class="number_plate badge badge-primary fs-12"></span></h2>
                        <h5> Selected Seats <span id="counter">0</span>:</h5>
                        <ul id="selected-seats">

                        </ul>
                        <p>Total: <b><span id="total">0</span> Kes</b></p>
                        
                    </div>
                    <div class="text-center btn-proceed-div">
                    <button class="my-3 btn btn-lg btn-block btn-primary btn-proceed" disabled data-bs-toggle="modal" data-bs-target="#passengerDetailsModal" data-trip="${
                      trip.id
                    }">
                        <svg aria-hidden="true" focusable="false"
                        data-prefix="far" data-icon="arrow-alt-right" role="img" xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 448 512" class="svg-inline--fa fa-arrow-alt-right fa-w-14">
                        <path fill="currentColor"
                            d="M176 80.048v73.798H48c-26.51 0-48 21.49-48 48v108.308c0 26.51 21.49 48 48 48h128v73.789c0 42.638 51.731 64.151 81.941 33.941l176-175.943c18.745-18.745 18.746-49.137 0-67.882l-176-175.952C227.792 15.958 176 37.325 176 80.048zM400 256L224 432V310.154H48V201.846h176V80l176 176z"
                            class=""></path>
                        </svg>
                        Proceed
                    </button>
                    </div>
                </div>
            </div>
    </div>`);
  });

  // toggle view seat charts
  $("body").on("click", ".btn-bookseats", function () {
    const resultcard = $($(this).parents(".result-card")[0]);
    $(resultcard.find(".seats")[0]).toggleClass("d-none");
  });

  // generate charts
  $(".seats-chart").each(function (_, el) {
    let firstSeatLabel = 1,
      cart = $($(el).parents(".seats").find("#selected-seats")[0]),
      counter = $($(el).parents(".seats").find("#counter")[0]),
      total = $($(el).parents(".seats").find("#total")[0]),
      proceedBtn = $($(el).parents(".seats").find(".btn-proceed")[0]),
      details = [];

    const tripId = $($(el).parents(".result-card")[0]).data("trip");
    let trip = trips.find((t) => t.id == tripId);

    var sc = $(el).seatCharts({
      map: trip.getBus().seats_chart,
      seats: {
        e: {
          price: trip.fare,
          classes: "economy-class", //your custom CSS class
          category: "Economy Class",
        },
      },
      naming: {
        top: false,
        getLabel: function (character, row, column) {
          return firstSeatLabel++;
        },
      },
      click: function () {
        if (this.status() == "available") {
          $(event.target).toggleClass("animated rubberBand");
          //let's create a new <li> which we'll add to the cart items
          $(
            '<li class="pb-3 pt-2">' +
              this.data().category +
              " Seat # " +
              this.settings.label +
              ": <b>Ksh " +
              this.data().price +
              '</b> <a href="javascript:void(0);"' +
              ' class="cancel-cart-item btn btn-danger btn-sm ms-2"><i class="fa fa-trash"></i> cancel</a></li>'
          )
            .attr("id", "cart-item-" + this.settings.id)
            .data("seatId", this.settings.id)
            .data("trip", trip.id)
            .appendTo(cart);

          /*
           * Lets update the counter and total
           *
           * .find function will not find the current seat, because it will change its stauts only after return
           * 'selected'. This is why we have to add 1 to the length and the current seat price to the total.
           */
          counter.text(sc.find("selected").length + 1);
          total.text(recalculateTotal(sc) + this.data().price);
          details.push({
            ["seatNo"]: this.settings.label,
            ["price"]: this.data().price,
          });

          if (details.length > 0) {
            proceedBtn.prop("disabled", false);
          } else {
            proceedBtn.prop("disabled", true);
          }

          return "selected";
        } else if (this.status() == "selected") {
          $(event.target).toggleClass("animated rubberBand");
          //update the counter
          counter.text(sc.find("selected").length - 1);
          //and total
          total.text(recalculateTotal(sc) - this.data().price);

          //remove the item from our cart
          $($(el).parents(".result-card")[0])
            .find("#cart-item-" + this.settings.id)
            .remove();

          no = this.settings.label;
          var filtered = details.filter(function (item) {
            return item.seatNo != no;
          });
          details = filtered;

          if (details.length > 0) {
            proceedBtn.prop("disabled", false);
          } else {
            proceedBtn.prop("disabled", true);
          }

          //seat has been vacated
          return "available";
        } else if (this.status() == "unavailable") {
          //seat has been already booked
          return "unavailable";
        } else {
          return this.style();
        }
      },
    });

    trip.sc = sc;

    trip.booked_seats.forEach((seatIndex) => {
      sc.get([sc.seatIds[seatIndex]]).status("unavailable");
    });
  });

  var selectedTrip;
  $("#passengerDetailsModal").on("show.bs.modal", function (event) {
    const proceedBtn = $(event.relatedTarget);
    selectedTrip = trips.find((t) => t.id == proceedBtn.data("trip"));
  });

  //this will handle "[cancel]" link clicks
  $("body").on("click", ".cancel-cart-item", function () {
    selectedTrip = trips.find(
      (t) => t.id == $(this).parents("li:first").data("trip")
    );
    //let's just trigger Click event on the appropriate seat, so we don't have to repeat the logic here

    selectedTrip.sc.get($(this).parents("li:first").data("seatId")).click();
  });

  $("#passengerDetailsForm").on("submit", function (e) {
    e.preventDefault();

    const selectedSeats = selectedTrip.sc.find("selected"),
      selectedSeatsLabels = selectedSeats.seats.map(
        (seat) => seat.settings.label
      );

    alert(`You have booked seat(s) ${selectedSeatsLabels.join(", ")}`);

    selectedSeats.seats.map((seat) => {
      seat.click();
    });

    selectedSeats.status("unavailable");

    $(`p.available-seats-${selectedTrip.id}`).text(
      `${
        selectedTrip.sc.seatIds.length -
        selectedTrip.sc.find("unavailable").length
      } seats`
    );

    $("#passengerDetailsModal").modal("hide");
  });
});

// Trip

function Trip(
  id,
  bus_id,
  route_id,
  fare,
  pickup_time,
  travel_date = new Date(),
  booked_seats = [],
  currency = "Ksh"
) {
  this.id = id;
  (this.bus_id = bus_id), (this.route_id = route_id);
  this.fare = fare;
  this.pickup_time = pickup_time;
  this.travel_date = travel_date;
  this.currency = currency;
  this.booked_seats = booked_seats;
  this.sc = null;
}

Trip.prototype.getBus = function () {
  return buses.find((b) => b.id == this.bus_id);
};

Trip.prototype.getRoute = function () {
  return routes.find((r) => r.id == this.route_id);
};

Trip.prototype.getAvailableSeats = function () {
  const bus = this.getBus();
  return bus.seats - this.booked_seats.length;
};

// Bus

function Bus(id, reg_no, seats = 45, seats_chart = null) {
  this.reg_no = reg_no;
  this.seats = seats;
  this.id = id;
  this.seats_chart = [
    "ee____",
    "eee_ee",
    "___e_e",
    "ee_eee",
    "ee_eee",
    "ee_eee",
    "ee_eee",
    "ee_eee",
    "ee_eee",
    "eeeeee",
  ];

  if (seats_chart) {
    this.seats_chart = seats_chart;
  }
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

let recalculateTotal = (sc) => {
  var total = 0;

  //basically find every selected seat and sum its price
  sc.find("selected").each(function () {
    total += this.data().price;
  });

  return total;
};
