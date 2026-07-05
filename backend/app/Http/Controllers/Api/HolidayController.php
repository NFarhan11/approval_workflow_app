<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\HolidayResource;
use App\Models\Holiday;
use Illuminate\Http\Request;

class HolidayController extends Controller
{
    // GET /api/holidays — every authenticated user can see the calendar
    public function index()
    {
        return HolidayResource::collection(Holiday::orderBy('date')->get());
    }

    // POST /api/admin/holidays
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'date' => 'required|date|unique:holidays,date',
        ]);

        $holiday = Holiday::create($validated);

        return new HolidayResource($holiday);
    }

    // DELETE /api/admin/holidays/{holiday}
    public function destroy(Holiday $holiday)
    {
        $holiday->delete();

        return response()->json(['message' => 'Holiday deleted successfully']);
    }
}
