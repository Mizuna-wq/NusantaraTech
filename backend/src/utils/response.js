// Format response sukses yang konsisten: { success, message, data }
export function success(res, message, data = {}, status = 200) {
  return res.status(status).json({ success: true, message, data });
}
