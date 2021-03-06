   let startDate = null;
   let endDate = null;

   function currrent_date() {
       const today = new Date();
       const dd = String(today.getDate()).padStart(2, '0');
       const mm = String(today.getMonth() + 1).padStart(2, '0');
       const yyyy = today.getFullYear();
       return (yyyy + '-' + mm + '-' + dd);
   }

   $('#daterange-ranges').daterangepicker({
           startDate: moment().subtract(29, 'days'),
           endDate: moment(),
           minDate: '2020-01-01',
           maxDate: currrent_date(),
           ranges: {
               'Today': [moment(), moment()],
               'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
               'Last 7 Days': [moment().subtract(6, 'days'), moment()],
               'Last 30 Days': [moment().subtract(29, 'days'), moment()],
               'This Month': [moment().startOf('month'), moment().endOf('month')],
               'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
           },
           opens: $('html').attr('dir') == 'rtl' ? 'right' : 'left',
           applyClass: 'btn-sm btn-success btn-block',
           cancelClass: 'btn-sm btn-danger btn-block',
           locale: {
               format: 'YYYY-MM-DD',
               direction: $('html').attr('dir') == 'rtl' ? 'rtl' : 'ltr'
           }
       },
       function(start, end) {
           $('#daterange-ranges span').html(start.format('MMMM D') + ' - ' + end.format('MMMM D'));
           startDate = start.format('YYYY-MM-DD');
           endDate = end.format('YYYY-MM-DD');
           loadCnxData($("#daterange-ranges").data('daterangepicker').startDate.format('YYYY-MM-DD'), $("#daterange-ranges").data('daterangepicker').endDate.format('YYYY-MM-DD'));
       }
   );
   $('#daterange-ranges span').html(moment().subtract(29, 'days').format('MMMM D') + ' - ' + moment().format('MMMM D'));


   loadCnxData($("#daterange-ranges").data('daterangepicker').startDate.format('YYYY-MM-DD'), $("#daterange-ranges").data('daterangepicker').endDate.format('YYYY-MM-DD'));
   function loadCnxData(startDate,endDate) {
       if(!startDate){ startDate = currrent_date();}
       if(!endDate){ endDate = currrent_date();}
       $.ajax({
           url: '/admin/setting/logindetails',
           type: 'post',
           contentType: "application/x-www-form-urlencoded;charset=utf-8",
           data: {
               startDate:startDate,endDate:endDate
           },
           dataType: 'json',
           success: function(data, textStatus, xhr) {
               var status = xhr.status;
               if (status === 200) {
                   generate_data(data);
               } else if (status === 201) {
                   error(data["data"].Msg);
               }
           }
       });
   }

   let $pagination = $('#pagination'),
       totalRecords = 0,
       records = [],
       displayRecords = [],
       recPerPage = 4,
       page = 1,
       totalPages = 0;

   // Generate Events
   function generate_table() {
       $('#fetch').html('');
       let appendToResult = "";
       for (let i = 0; i < displayRecords.length; i++) {
           const htmlStr = `<li class='feed-item'>
                       <span class='date'>Date : ${displayRecords[i].Date} </span>
                       <span class='activity-text'>-> Ip : ${displayRecords[i].Ip} -- Etat: ${displayRecords[i].Etat} </span><br/>
                       <span class='activity-text'>-> Description : ${displayRecords[i].Desc}</span>
                       </li>`;
           appendToResult = appendToResult.concat(htmlStr);
       }
       $('#fetch').append(appendToResult);
   }

   function generate_loader() {
       $('#fetch').html('');
       let appendToResult = "";
       for (var i = 0; i < 5; i++) {
           appendToResult = appendToResult.concat(`
               <div class='ph-item'>
               <div><div class='ph-row'>
               <div class='ph-col-8 empty'></div>
               <div class='ph-col-6'></div>
               <div class='ph-col-6 empty'></div>
               <div class='ph-col-12'></div>
               <div class='ph-col-10 empty'></div>
               </div></div></div>`);
       }
       $('#fetch').append(appendToResult)
   }

   function apply_pagination() {
       $pagination.twbsPagination({
           totalPages: totalPages,
           visiblePages: 6,
           onPageClick: function(event, page) {
               displayRecordsIndex = Math.max(page - 1, 0) * recPerPage;
               endRec = (displayRecordsIndex) + recPerPage;
               displayRecords = records.slice(displayRecordsIndex, endRec);
               generate_table();
           }
       });
   }

   function generate_data(data) {
       $pagination.twbsPagination('destroy');
       $("#fetch").empty();
       records = data;
       totalRecords = records.length;
       if (data.length === 0) {
           totalPages = 1;
           generate_loader();
           setTimeout(function() {
               $("#fetch").html("<h4 class='h4 text-center' style='padding:180px 0;'>Oops! There is No Record Found!</h4>");
               $("#pagination").html(`
                   <li class="page-item first disabled"><a href="#" class="page-link">First</a></li>
                   <li class="page-item prev disabled"><a href="#" class="page-link">Previous</a></li>
                   <li class="page-item active"><a href="#" class="page-link">1</a></li>
                   <li class="page-item next disabled"><a href="#" class="page-link">Next</a></li>
                   <li class="page-item last disabled"><a href="#" class="page-link">Last</a></li>`);
           }, 250);
       } else {
           totalPages = Math.ceil(totalRecords / recPerPage);
           generate_loader();
           setTimeout(apply_pagination, 250);
       }
   }