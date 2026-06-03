@extends('layouts.app')

@section('content')
<div class="container">
    <h1>Data Alternatif (Program Studi)</h1>
    <a href="{{ route('admin.alternatif.create') }}" class="btn btn-primary">Tambah Alternatif</a>
    <table class="table">
        <thead>
            <tr>
                <th>ID</th>
                <th>Kode Prodi</th>
                <th>Nama Prodi</th>
                <th>Aksi</th>
            </tr>
        </thead>
        <tbody>
            @foreach($alternatifs as $alternatif)
            <tr>
                <td>{{ $alternatif->id }}</td>
                <td>{{ $alternatif->kode_prodi }}</td>
                <td>{{ $alternatif->nama_prodi }}</td>
                <td>
                    <a href="{{ route('admin.alternatif.edit', $alternatif->id) }}" class="btn btn-warning">Edit</a>
                    <form action="{{ route('admin.alternatif.destroy', $alternatif->id) }}" method="POST" style="display:inline;">
                        @csrf
                        @method('DELETE')
                        <button type="submit" class="btn btn-danger">Hapus</button>
                    </form>
                </td>
            </tr>
            @endforeach
        </tbody>
    </table>
</div>
@endsection