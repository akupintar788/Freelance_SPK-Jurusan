<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">

<style>
body{
    font-family: DejaVu Sans;
    font-size:12px;
}

h2{
    text-align:center;
}

table{
    width:100%;
    border-collapse:collapse;
}

th,td{
    border:1px solid #000;
    padding:6px;
}

th{
    background:#f3f4f6;
}
</style>

</head>

<body>

<h2>
LAPORAN HASIL REKOMENDASI JURUSAN
</h2>

<table>

<thead>
<tr>
    <th>No</th>
    <th>Nama Siswa</th>
    <th>Kelas</th>
    <th>Jurusan Rekomendasi</th>
    <th>Nilai Preferensi</th>
    <th>Ranking</th>
</tr>
</thead>

<tbody>

@foreach($data as $index => $row)

<tr>
    <td>{{ $index + 1 }}</td>
    <td>{{ $row->nama_siswa }}</td>
    <td>{{ $row->kelas }}</td>
    <td>{{ $row->rekomendasi ?? '-' }}</td>
    <td>
        {{ $row->skor ? number_format($row->skor,4) : '-' }}
    </td>
    <td>#{{ $index + 1 }}</td>
</tr>

@endforeach

</tbody>

</table>

</body>
</html>