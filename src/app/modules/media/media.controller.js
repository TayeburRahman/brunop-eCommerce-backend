const catchAsync = require("../../../shared/catchasync");
const sendResponse = require("../../../shared/sendResponse"); 
const AddsService = require("./media.service");

const insertIntoDB = catchAsync(async (req, res) => {
  const result = await AddsService.insertIntoDB(req.files, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Adds created successfully',
    data: result,
  });
});

const updateAdds = catchAsync(async (req, res) => {
  const result = await AddsService.updateAdds(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Adds updated successfully',
    data: result,
  });
});

const deleteAdds = catchAsync(async (req, res) => {
  const result = await AddsService.deleteAdds(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Adds deleted successfully',
    data: result,
  });
});

const allAdds = catchAsync(async (req, res) => {
  const result = await AddsService.allAdds(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Adds retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const AddsController = {
  insertIntoDB,
  allAdds,
  updateAdds,
  deleteAdds,
}

module.exports = AddsController;